from flask import Flask, jsonify,request,url_for,send_from_directory,render_template
from gevent.pywsgi import WSGIServer
import json
from datetime import datetime
import database as db
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

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
    http_server = WSGIServer(('0.0.0.0', port), app,log=None)
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


@app.route('/dev')
@limiter.exempt
def serve_dev():
    return render_template('game.html')

#@app.route('/scores')
#@limiter.exempt
#def scores():
    # Render the HTML file (index.html in this case)
#    return render_template('scores.html')



@app.route('/api/checkRoomExists/<roomID>', methods=['GET'])
@limiter.exempt
def check_room_exists(roomID):
    if db.checkIfRoomExists(roomID):
        return jsonify({"exists": True})
    else:
        return jsonify({"exists": False})



@app.route('/scores', defaults={'roomID': '0'})
@app.route('/scores/<roomID>')
@limiter.exempt
def scores(roomID):
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
    
@app.route('/api/game/generateChallenge', methods=['POST'])
@limiter.limit("200 per day")
def generateChallenge():
    if request.method == 'POST':
                try:
                    challenge=gameMorse.generateChallenge(ENV_compLength)
                    sessionID=gameMorse.generateUUID()
                    db.insertGameStart(sessionID,challenge)
                    return jsonify({"UUID":sessionID})
                except Exception as e:
                    return jsonify({"error": "Invalid JSON data"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405

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
                                score=gameMorse.calculateResult(result[0],result[1],result[2])
                                if(score[0]==-1):return jsonify({"error": "Game not finished yet"}), 400
                                mode=""
                                if(json_data["mode"]==0):
                                    mode="Easy"
                                elif(json_data["mode"]==1):
                                    mode="Hard"
                                else:
                                    mode="Champion"
                                data={
                                    "id":json_data["name"],
                                    "mode":mode,
                                    "score":score[0],
                                    "total":ENV_compLength,
                                    "totalTime":score[1]
                                }
                                db.insertToDatabase(data)
                                db.destroyEntry(json_data["UUID"])
                                return jsonify({"score":score[0],"time":score[1],"total":ENV_compLength})
                            else:
                                return jsonify({"error": "INVALID OR NO UUID!"}), 400
                    else:
                            return jsonify({"error": "Insuficient data"}), 400
                except Exception as e:
                    return jsonify({"error": "Invalid JSON data"}), 400
        else:
            return jsonify({"error": "Invalid content type, JSON expected"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405


if __name__ == '__main__':
    #Development
    app.run(debug=True,port=6446)
    #print(checkSession({"UUID":"1234"}))
    #serve(5432)
    
