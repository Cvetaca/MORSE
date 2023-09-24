import sqlite3
con=sqlite3.connect("/var/www/morse/database.db")
cur = con.cursor()
cur.execute("DROP TABLE scores")
con.commit()
cur.execute("""CREATE TABLE scores (
            rawDate TIMESTAMP NOT NULL,
            name nvarchar(50) NOT NULL,
            mode nvarchar(10) NOT NULL,
            score int NOT NULL,
            total int NOT NULL,
            time decimal(10,2) NOT NULL
            )""")
con.commit()
cur.close()
con.close()
