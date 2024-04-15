from flask import Flask, jsonify,request,url_for,send_from_directory,render_template
from gevent.pywsgi import WSGIServer
import json
from datetime import datetime
import database as db
from flask_limiter import Limiter
import argparse

import gameMorse
from flask import render_template

ENV_compLength=30

def getIp():
    return request.headers.get('cf-connecting-ip')

app = Flask(__name__)

limiter = Limiter(
    app=app,
    key_func=getIp,
    storage_uri="memory://",
    
)





def serve(port):
    #http_server = WSGIServer(('0.0.0.0', port), app,log=None)
    http_server = WSGIServer(('0.0.0.0', port), app)
    http_server.serve_forever()




@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404



def checkSession(response):
    if "UUID" in response.keys():
        return db.checkUUID(response["UUID"])
    else:
        return False


@app.route('/static/<path:filename>')
@limiter.exempt
def serve_website(filename):
    return send_from_directory('static', filename)

@app.route('/')
@limiter.exempt
def serve_root():
    return render_template('index.html')


@app.route('/game')
@limiter.exempt
def serve_dev():
    return render_template('game.html')

#@app.route('/scores')
#@limiter.exempt
#def scores():
    # Render the HTML file (index.html in this case)
#    return render_template('scores.html')



@app.route('/api/checkGameSession/<UUID>', methods=['GET'])
@limiter.limit("200 per day")
def checkSession(UUID):
    return "OK" if db.checkUUID(UUID) else "NOK"

@app.route('/api/checkRoomExists/<roomID>', methods=['GET'])
@limiter.limit("200 per day")
def check_room_exists(roomID):
    return "OK" if db.checkIfRoomExists(roomID) else "NOK"


@app.route('/room/<roomID>')
@limiter.exempt
def join_room(roomID):
        if db.checkIfRoomExists(roomID):
            return f'''
            <script>
                localStorage.setItem('roomID', '{roomID}');
                window.location.href = '/';
            </script>
            '''
        else:
            return render_template('404room.html'), 404


@app.route('/scores', defaults={'roomID': '0'})
@app.route('/scores/<roomID>')
@limiter.exempt
def scores(roomID):
    if roomID=='0':
        return render_template('scores.html')
    if db.checkIfRoomExists(roomID):
        return render_template('scores.html')
    return render_template('404room.html'), 404




@app.route('/api/results/<roomID>', methods=['POST','GET'])
@limiter.exempt
def get_general_config(roomID):
    if request.method == 'POST':
        #req=request.get_json()
        #db.insertToDatabase(req)
        return jsonify({"error":"POST TO DATABASE NOT ALLOWED"}),405
    else:
        out=db.getFromDatabase(roomID)
        return jsonify(out)
    
@app.route('/api/game/generateChallenge/<roomID>', methods=['GET'])
@limiter.limit("200 per day")
def generateChallenge(roomID):
    if request.method == 'GET':
                try:
                    challenge=gameMorse.generateChallenge(ENV_compLength)
                    sessionID=gameMorse.generateUUID()
                    db.insertGameStart(sessionID,challenge,roomID)
                    return jsonify({"UUID":sessionID})
                except Exception as e:
                    print(e)
                    return jsonify({"error": "Error in game creation"}), 400
    else:
        return jsonify({"error": "Only GET requests are allowed"}), 405

@app.route('/api/game/getChar', methods=['POST'])
@limiter.exempt
def getChar():
    if request.method == 'POST':
        if request.is_json:
                try:
                    json_data = request.get_json()
                    result=db.serveChar(json_data["UUID"])
                    if(result==-1):
                        return jsonify({"error": "End of challenge","END":1})
                    elif(result!=None):
                        return jsonify({"char": gameMorse.charToMorseArray(result),"END":0}) 
                    else: 
                        return jsonify({"error": "INVALID OR NO UUID!"}), 400
                   
                except Exception as e:
                    return jsonify({"error": "Invalid JSON data","err":str(e)}), 400
        else:
            return jsonify({"error": "Invalid content type, JSON expected"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405

@app.route('/api/game/postChar', methods=['POST'])
@limiter.exempt
def postChar():
    if request.method == 'POST':
        if request.is_json:
                try:
                    json_data = request.get_json()
                    if "char" in json_data.keys():
                            if len(json_data["char"])>1:
                                return jsonify({"error": "ONLY ONE CHARACTER ALLOWED! NO FUNNY BUSINESS PLEASE"}), 405 
                            response=db.updateChar(json_data["UUID"],json_data["char"])
                            if(response==0):
                                return jsonify({"message":"OK"})
                            elif(response==1): 
                                return jsonify({"message":"NOK"})
                            elif(response==2):
                                return jsonify({"error": "INVALID OR NO UUID!"}), 400
                            else:
                                return jsonify({"error": "End of challenge","END":1}), 418
                    else:
                             return jsonify({"error": "No key provided"}), 400
                   
                except Exception as e:
                    print(e)
                    return jsonify({"error": "Invalid JSON data"}), 400
        else:
            return jsonify({"error": "Invalid content type, JSON expected"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405

@app.route('/api/game/getResults', methods=['POST'])
@limiter.limit("200 per day")
def getResults():
    if request.method == 'POST':
        if request.is_json:
                try:
                    json_data = request.get_json()
                    if ("name" in json_data.keys() and "mode" in json_data.keys()):
                            result=db.getResults(json_data["UUID"])
                            if(result!=None):
                                score=gameMorse.calculateResult(result[0],result[1])
                                if(score==-1):return jsonify({"error": "Game not finished yet"}), 400
                                mode=""
                                if isinstance(json_data["mode"], str):
                                    json_data["mode"] = int(json_data["mode"])
                                if(json_data["mode"]==0):
                                    mode="Easy"
                                elif(json_data["mode"]==1):
                                    mode="Hard"
                                else:
                                    mode="Champion"
                                data={
                                    "id":json_data["name"],
                                    "mode":mode,
                                    "score":score,
                                    "total":ENV_compLength,
                                    "totalTime":result[3],
                                    "roomID":result[4]
                                }
                                db.insertToDatabase(data)
                                db.destroyEntry(json_data["UUID"])
                                #return jsonify({"score":score[0],"time":score[1],"total":ENV_compLength})
                                return jsonify({"score":score,"time":result[3],"total":ENV_compLength})
                            else:
                                return jsonify({"error": "INVALID OR NO UUID!"}), 400
                    else:
                            return jsonify({"error": "Insuficient data"}), 400
                except Exception as e:
                    print(e)
                    return jsonify({"error": "Invalid JSON data"}), 400
        else:
            return jsonify({"error": "Invalid content type, JSON expected"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405


@app.route('/api/createRoom', methods=['POST'])
@limiter.limit("20 per day")
def createRoom():
    if request.is_json:
        try:
            json_data = request.get_json()
            if "roomName" in json_data.keys():
                if(len(json_data["roomName"])>32):
                    return jsonify({"error": "Room name too long"}), 400
                roomID = db.createRoom(json_data["roomName"])
                if(roomID==False):
                    return jsonify({"error": "Room exists"}), 400
                return "", 200
            else:
                return jsonify({"error": "No room name provided"}), 400
        except Exception as e:
            print(e)
            return jsonify({"error": "Invalid JSON data"}), 400
    else:
        return jsonify({"error": "Invalid content type, JSON expected"}), 400
    
    

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', action='store_true', help='Activate development mode')
    parser.add_argument('-p', action='store_true', help='Activate production mode')
    args = parser.parse_args()

    if args.d:
        app.run(debug=True, port=6447)
    elif args.p:
        serve(6447)
    else:
        print('Please specify either -d or -p flag.')


