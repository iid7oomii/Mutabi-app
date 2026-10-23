import enum

class RelationshipType(enum.Enum):
    MOTHER = "mother"
    FATHER = "father"
    GUARDIAN = "guardian"
    THERAPIST = "therapist"
    DOCTOR = "doctor"
    OTHER = "other"
