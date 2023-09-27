import random
import uuid

def generateChallenge(challenge_length):
    characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    challenge = []

    for i in range(challenge_length):
        random_index = random.randint(0, len(characters) - 1)
        random_character = characters[random_index].upper()
        challenge.append(random_character)

    return ",".join(challenge)

def generateUUID():
    return str(uuid.uuid4())