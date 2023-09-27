from flask import Flask, jsonify,request,url_for,send_from_directory,render_template
from gevent.pywsgi import WSGIServer
import json
import sys
import os
from datetime import datetime
import database as db
import threading
import math




stop_flag = threading.Event()


app = Flask(__name__)



def serve(port):
    http_server = WSGIServer(('0.0.0.0', port), app,log=None)
    http_server.serve_forever()


@app.route('/static/<path:filename>')
def serve_website(filename):
    return send_from_directory('static', filename)

@app.route('/')
def serve_root():
    return render_template('index.html')

@app.route('/scores')
def serve_scores():
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

if __name__ == '__main__':
    #Development
    #app.run(debug=True,port=6446)
    serve(6446)
