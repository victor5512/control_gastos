#Proteger contraseñas y tokens
import hashlib
import secrets
from pwdlib import PasswordHash

password_hasher=PasswordHash.recommended()

#hash_password protege las contraseñas con argon2
def hash_password(password:str)->str:
    return password_hasher.hash(password)

#verify_password comprueba si la contraseña coincide con su hash
def verify_password(password:str, password_hash:str,)->bool: 
    return password_hasher.verify(password,password_hash,)

#gerate_session_token sirve para crear automaticamente tokens
def generate_session_token()->str:
    return secrets.token_urlsafe(32)

#hash_session_token produce un sha-256 solamente para los tokens que se almacenaran en la tabla sessiones no para las contraseñas
def hash_session_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()