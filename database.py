import sqlite3
import json
from datetime import datetime

def insertToDatabase(dataIn):
    data=(datetime.now(),dataIn['id'],dataIn['mode'],dataIn['score'],dataIn["total"],dataIn["totalTime"])
    con=sqlite3.connect("/var/www/morse/database.db")
    cur = con.cursor()
    cur.execute("INSERT INTO scores VALUES (?,?,?,?,?,?)",data)
    con.commit()
    cur.close()
    con.close()
    return "OK"

def getLastID():
    con=sqlite3.connect("/var/www/morse/database.db")
    cur = con.cursor()
    out=cur.execute("SELECT MAX(rowid) from invoices").fetchone()[0]
    cur.close()
    con.close()
    if out==None:
        return 0
    return out

def getFromDatabase():
    con=sqlite3.connect("/var/www/morse/database.db")
    cur = con.cursor()
    out=cur.execute("SELECT * FROM scores").fetchall()
    cur.close()
    con.close()
    return out

def getFromDatabaseByDate(dateFrom,dateTo):
    con=sqlite3.connect("/var/www/morse/database.db")
    cur = con.cursor()
    out=cur.execute(f"""SELECT rowid,tDate,tTime,pipeID,item,amount,total FROM "invoices"
WHERE rawDate BETWEEN "{dateFrom} 00:00:01" AND "{dateTo} 23:59:59";""").fetchall()
    json_data = []
    if(out==None):
        return None
    for item in out:
        json_data.append({
        'id': item[0],
        'date': item[1],
        'time': item[2],
        'pipeID': item[3],
        'item': item[4],
        'amount': str(item[5]).replace(".",","),
        'total': str(item[6]).replace(".",",")
        })
    json_object = json.dumps(json_data, indent=4)
    cur.close()
    con.close()
    return json_object

if __name__=="__main__":
   print("OK")