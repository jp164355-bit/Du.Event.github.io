import mysql.connector
import matplotlib.pyplot as plt
from datetime import datetime

def generate_analytics():
    con = mysql.connector.connect(
        host='localhost', user='root', password='password',
        database='dusol_events'
    )
    cursor = con.cursor()
    
    # Event Stats
    cursor.execute("SELECT name, registrations FROM events ORDER BY registrations DESC")
    events = cursor.fetchall()
    
    names, counts = zip(*events)
    plt.figure(figsize=(10,6))
    plt.bar(names[:5], counts[:5])
    plt.title('Top 5 Events by Registrations')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('event_analytics.png')
    plt.show()

generate_analytics()
