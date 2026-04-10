try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError
    
    argon2_hasher = PasswordHasher()
    
    def hash_password(password: str) -> str:
        """
        Hash a password using Argon2.

        Args:
            password (str): The plain text password to hash.

        Returns:
            str: The hashed password.
        """
        return argon2_hasher.hash(password)

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a plain password against a hashed password using Argon2.

        Args:
            plain_password (str): The plain text password.
            hashed_password (str): The hashed password to verify against.

        Returns:
            bool: True if the password matches, False otherwise.
        """
        try:
            argon2_hasher.verify(hashed_password, plain_password)
            return True
        except VerifyMismatchError:
            return False
            
except Exception:
    # Fallback to simple hashing (NOT SECURE - for testing only)
    import hashlib
    
    def hash_password(password: str) -> str:
        """Simple SHA256 hash (NOT SECURE - fallback only)."""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify SHA256 hash."""
        return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password
