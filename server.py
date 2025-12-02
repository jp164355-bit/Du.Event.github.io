from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import jwt
import hashlib
import os
from datetime import datetime, timedelta
from werkzeug.utils import secure_filename
import mysql.connector

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'du-sol-secret-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:password@localhost/dusol_events'
app.config['UPLOAD_FOLDER'] = 'uploads'
db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    college_id = db.Column(db.String(20), unique=True)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200))
    date = db.Column(db.Date)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    image_url = db.Column(db.String(300))
    map_link = db.Column(db.String(500))
    registrations = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer)
    student_name = db.Column(db.String(100))
    roll_number = db.Column(db.String(50))
    phone = db.Column(db.String(15))
    email = db.Column(db.String(100))
    year = db.Column(db.String(20))
    id_card_url = db.Column(db.String(300))
    registered_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([{
        'id': e.id, 'name': e.name, 'date': e.date.isoformat(),
        'location': e.location, 'description': e.description,
        'image_url': e.image_url, 'map_link': e.map_link,
        'registrations': e.registrations
    } for e in events])

@app.route('/api/events', methods=['POST'])
def create_event():
    file = request.files.get('image')
    filename = secure_filename(file.filename) if file else None
    
    event = Event(
        name=request.form['name'],
        date=datetime.fromisoformat(request.form['date']).date(),
        location=request.form['location'],
        description=request.form['description'],
        created_by=1  # From JWT
    )
    
    if filename:
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        event.image_url = f"/uploads/{filename}"
    
    event.map_link = f"https://google.com/maps?q={event.location}"
    db.session.add(event)
    db.session.commit()
    
    return jsonify({'success': True, 'event_id': event.id})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(college_id=data['collegeId']).first()
    
    if user and hashlib.sha256(data['password'].encode()).hexdigest() == user.password_hash:
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({
            'success': True,
            'userId': user.id,
            'token': token
        })
    return jsonify({'success': False})

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True, port=5000)
