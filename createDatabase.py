import sqlite3
con=sqlite3.connect("/var/www/morseDEV/database.db")
cur = con.cursor()
cur.execute("DROP TABLE IF EXISTS scores")
con.commit()
cur.execute("DROP TABLE IF EXISTS gameData")
con.commit()
cur.execute("DROP TABLE IF EXISTS rooms")
con.commit()
cur.execute("""CREATE TABLE scores (
            rawDate TIMESTAMP NOT NULL,
            name nvarchar(50) NOT NULL,
            mode nvarchar(10) NOT NULL,
            score int NOT NULL,
            total int NOT NULL,
            time decimal(10,2) NOT NULL,
            roomID nvarchar(32) DEFAULT '0'
            )""")
con.commit()

cur.execute("""CREATE TABLE gameData (
            rawDate TIMESTAMP NOT NULL,
            id nvarchar(40) NOT NULL,
            challenge nvarchar(105) NOT NULL,
            response nvarchar(105),
            charIndex int NOT NULL,
            lastCharRequest TIMESTAMP,
            timeIncrement REAL NOT NULL DEFAULT 0,
            roomID nvarchar(32) DEFAULT '0'
            )""")
con.commit()

cur.execute("""CREATE TABLE rooms (
            rawDate TIMESTAMP NOT NULL,
            roomID nvarchar(32) NOT NULL
            )""")
con.commit()

cur.close()
con.close()
