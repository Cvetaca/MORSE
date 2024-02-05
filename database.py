import sqlite3
from contextlib import contextmanager
from datetime import datetime

# Configuration
DB_PATH = "/var/www/morseDEV/database.db"

@contextmanager
def get_database_connection():
    con = sqlite3.connect(DB_PATH)
    try:
        yield con
    except sqlite3.Error as e:
        con.rollback() 
        raise e
    finally:
        con.close()

# Insert data into the database
def insertToDatabase(dataIn):
    data = (datetime.now(), dataIn['id'], dataIn['mode'], dataIn['score'], dataIn["total"], dataIn["totalTime"],0)
    with get_database_connection() as con:
        cur = con.cursor()
        cur.execute("INSERT INTO scores VALUES (?,?,?,?,?,?,?)", data)
        con.commit()

# Get the last ID from the database
def getLastID():
    with get_database_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT MAX(rowid) FROM scores")
        out = cur.fetchone()[0]

    if out is None:
        return 0
    return out

# Get all data from the database
def getFromDatabase(roomID):
    with get_database_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT * FROM scores WHERE roomID = ?",(roomID,))
        out = cur.fetchall()

    return out

def checkIfRoomExists(roomID):
    with get_database_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT EXISTS(SELECT 1 FROM scores WHERE roomID = ?)", (roomID,))
        exists = cur.fetchone()[0]
        if exists:
            return True
        else:
            return False

def checkUUID(UUID):
    with get_database_connection() as con:
        cur = con.cursor()
        cur.execute("SELECT EXISTS(SELECT 1 FROM gameData WHERE id = ?)", (UUID,))
        exists = cur.fetchone()[0]
        if exists:
            return True
        else:
            return False
def insertGameStart(sessionID,challenge):
    data = (datetime.now(), sessionID, challenge, "", 0,None,0.0,0)
    with get_database_connection() as con:
        cur = con.cursor()
        cur.execute("INSERT INTO gameData VALUES (?,?,?,?,?,?,?,?)", data)
        con.commit()
        
def updateChar(UUID,char):
    with get_database_connection() as con:
        cur = con.cursor()
        response=cur.execute("SELECT response,charIndex,challenge,timeIncrement,lastCharRequest FROM gamedata WHERE id = ?", (UUID,)).fetchone()
        if(response==None):return 2
        getChar=response[0]
        index=response[1]
        challenge=str(response[2]).split(",")
        if(index>=len(challenge)): return 3
        ok=1
        char=char.upper()
        if(challenge[index]==char):ok=0
        if(index==0):
                getChar=getChar+char.upper()
        else:
                getChar=getChar+","+char.upper()
        index=index+1
        newTimeIncrement=float(response[3])+float((datetime.now()-datetime.strptime(response[4], "%Y-%m-%d %H:%M:%S.%f")).total_seconds())
        cur.execute("UPDATE gameData SET response = ?, charIndex = ?,timeIncrement=? WHERE id = ?",(getChar,index,newTimeIncrement,UUID))
        con.commit()
        return ok
    
def getTime(UUID):
    with get_database_connection() as con:
        cur = con.cursor()
        response=cur.execute("SELECT timeIncrement FROM gamedata WHERE id = ?", (UUID,)).fetchone()
        if(response==None):return None
        return response[0]

def serveChar(UUID):
    with get_database_connection() as con:
        cur = con.cursor()
        response=cur.execute("SELECT challenge,charIndex FROM gamedata WHERE id = ?", (UUID,)).fetchone()
        cur.execute("UPDATE gameData SET lastCharRequest=? WHERE id = ?",(datetime.now(),UUID))
        con.commit()
        if(response==None):return None
        challenge=str(response[0]).split(",")
        index=response[1]
        if(index>=len(challenge)):return -1
        return challenge[index]

def getResults(UUID):
    with get_database_connection() as con:
        cur = con.cursor()
        response=cur.execute("SELECT challenge,response,rawDate,timeIncrement FROM gamedata WHERE id = ?", (UUID,)).fetchone()
        if(response==None):return None
        challenge=str(response[0]).split(",")
        getChar=str(response[1]).split(",")
        rawDate=response[2]
        timeIncrement=response[3]
        return (challenge,getChar,rawDate,timeIncrement)
    
def destroyEntry(UUID):
    #DELETE FROM your_table_name WHERE id = ?
    with get_database_connection() as con:
        cur = con.cursor()
        cur.execute("DELETE FROM gamedata WHERE id = ?", (UUID,))
        con.commit()
        return "OK"
    

if __name__ == "__main__":
    print(updateChar("rrr","c"))