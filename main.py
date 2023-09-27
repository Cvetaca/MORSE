from flask import Flask, jsonify,request,url_for,send_from_directory,render_template
from gevent.pywsgi import WSGIServer
import json
from datetime import datetime
import database as db

import gameMorse

ENV_compLength=30



app = Flask(__name__)



def serve(port):
    http_server = WSGIServer(('0.0.0.0', port), app,log=None)
    http_server.serve_forever()


def checkSession(response):
    if "UUID" in response.keys():
        return db.checkUUID(response["UUID"])
    else:
        return False


@app.route('/static/<path:filename>')
def serve_website(filename):
    return send_from_directory('static', filename)

@app.route('/')
def serve_root():
    return render_template('index.html')

@app.route('/scores')
def scores():
    # Render the HTML file (index.html in this case)
    return render_template('scores.html')


@app.route('/api/results', methods=['POST','GET'])
def get_general_config():
    if request.method == 'POST':
        req=request.get_json()
        db.insertToDatabase(req)
        return "OK"
    else:
        out=db.getFromDatabase()
        return jsonify(out)
    
@app.route('/api/game/generateChallenge', methods=['POST'])
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
def getChar():
    if request.method == 'POST':
        if request.is_json:
                try:
                    json_data = request.get_json()
                    if(checkSession(json_data)):
                            return jsonify({"char": db.serveChar(json_data["UUID"])}) 
                    else: 
                        return jsonify({"error": "INVALID OR NO UUID!"}), 400
                   
                except Exception as e:
                    return jsonify({"error": "Invalid JSON data"}), 400
        else:
            return jsonify({"error": "Invalid content type, JSON expected"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405

@app.route('/api/game/postChar', methods=['POST'])
def postChar():
    if request.method == 'POST':
        if request.is_json:
                try:
                    json_data = request.get_json()
                    if(checkSession(json_data)):
                        if "char" in json_data.keys():
                            if(db.updateChar(json_data["UUID"],json_data["char"])):
                                return jsonify({"message":"Char received"})
                            else: 
                                return jsonify({"error":"Some weird shit"}),400
                        else:
                             return jsonify({"error": "No key provided"}), 400
                    else: 
                        return jsonify({"error": "INVALID OR NO UUID!"}), 400
                   
                except Exception as e:
                    return jsonify({"error": "Invalid JSON data"}), 400
        else:
            return jsonify({"error": "Invalid content type, JSON expected"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405

@app.route('/api/game/getResults', methods=['POST'])
def getResults():
    if request.method == 'POST':
        if request.is_json:
                try:
                    json_data = request.get_json()
                    if(checkSession(json_data)):
                            
                        return jsonify({"message": "JSON data received successfully"})
                    else: 
                        return jsonify({"error": "INVALID OR NO UUID!"}), 400
                except Exception as e:
                    return jsonify({"error": "Invalid JSON data"}), 400
        else:
            return jsonify({"error": "Invalid content type, JSON expected"}), 400
    else:
        return jsonify({"error": "Only POST requests are allowed"}), 405


if __name__ == '__main__':
    #Development
    #app.run(debug=True,port=6446)
    #print(checkSession({"UUID":"1234"}))
    serve(6446)
