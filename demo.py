import random

def generate_challenge(challenge_length):
    characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
    challenge = []

    for i in range(challenge_length):
        random_index = random.randint(0, len(characters) - 1)
        random_character = characters[random_index].upper()
        challenge.append(random_character)

    return ",".join(challenge)

# Example usage:
challenge = generate_challenge(30)
print(challenge)