from src.db import db

class DBUtils:
    """Generic database utility class for CRUD operations on SQLAlchemy models."""

    @staticmethod
    def create(model_class, **kwargs):
        """Create a new record."""
        instance = model_class(**kwargs)
        db.session.add(instance)
        db.session.commit()
        return instance

    @staticmethod
    def get_by_id(model_class, record_id):
        """Retrieve a record by ID."""
        return db.session.get(model_class, record_id)
    
    @staticmethod
    def get_all_by_uid(model_class, uid):
        """Retrieve all records by user UID."""
        return model_class.query.filter_by(user_uid=uid).all()

    @staticmethod
    def get_all(model_class):
        """Retrieve all records of a model."""
        return model_class.query.all()

    @staticmethod
    def update(model_class, record_id, **kwargs):
        """Update fields of a record."""
        instance = db.session.get(model_class, record_id)
        if not instance:
            return None
        for key, value in kwargs.items():
            setattr(instance, key, value)
        db.session.commit()
        return instance

    @staticmethod
    def delete(model_class, record_id):
        """Delete a record by ID."""
        instance = db.session.get(model_class, record_id)
        if not instance:
            return False
        db.session.delete(instance)
        db.session.commit()
        return True
