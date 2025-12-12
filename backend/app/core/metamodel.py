from enum import Enum
from typing import Optional, Set, Dict, Any, List
from pydantic import BaseModel, Field
import uuid

class Layer(str, Enum):
    STRATEGY = "Strategy"
    BUSINESS = "Business"
    APPLICATION = "Application"
    TECHNOLOGY = "Technology"
    PHYSICAL = "Physical"
    MOTIVATION = "Motivation"
    IMPLEMENTATION = "Implementation & Migration"
    COMPOSITE = "Composite"

class ElementType(str, Enum):
    # Strategy Layer
    RESOURCE = "Resource"
    CAPABILITY = "Capability"
    COURSE_OF_ACTION = "CourseOfAction"
    VALUE_STREAM = "ValueStream"

    # Business Layer
    BUSINESS_ACTOR = "BusinessActor"
    BUSINESS_ROLE = "BusinessRole"
    BUSINESS_COLLABORATION = "BusinessCollaboration"
    BUSINESS_INTERFACE = "BusinessInterface"
    BUSINESS_PROCESS = "BusinessProcess"
    BUSINESS_FUNCTION = "BusinessFunction"
    BUSINESS_INTERACTION = "BusinessInteraction"
    BUSINESS_EVENT = "BusinessEvent"
    BUSINESS_SERVICE = "BusinessService"
    BUSINESS_OBJECT = "BusinessObject"
    CONTRACT = "Contract"
    REPRESENTATION = "Representation"
    PRODUCT = "Product"

    # Application Layer
    APPLICATION_COMPONENT = "ApplicationComponent"
    APPLICATION_COLLABORATION = "ApplicationCollaboration"
    APPLICATION_INTERFACE = "ApplicationInterface"
    APPLICATION_FUNCTION = "ApplicationFunction"
    APPLICATION_INTERACTION = "ApplicationInteraction"
    APPLICATION_PROCESS = "ApplicationProcess"
    APPLICATION_EVENT = "ApplicationEvent"
    APPLICATION_SERVICE = "ApplicationService"
    DATA_OBJECT = "DataObject"

    # Technology Layer
    NODE = "Node"
    DEVICE = "Device"
    SYSTEM_SOFTWARE = "SystemSoftware"
    TECHNOLOGY_COLLABORATION = "TechnologyCollaboration"
    TECHNOLOGY_INTERFACE = "TechnologyInterface"
    PATH = "Path"
    COMMUNICATION_NETWORK = "CommunicationNetwork"
    TECHNOLOGY_FUNCTION = "TechnologyFunction"
    TECHNOLOGY_PROCESS = "TechnologyProcess"
    TECHNOLOGY_INTERACTION = "TechnologyInteraction"
    TECHNOLOGY_EVENT = "TechnologyEvent"
    TECHNOLOGY_SERVICE = "TechnologyService"
    ARTIFACT = "Artifact"

    # Physical Layer
    FACILITY = "Facility"
    EQUIPMENT = "Equipment"
    DISTRIBUTION_NETWORK = "DistributionNetwork"
    MATERIAL = "Material"

    # Motivation Layer
    STAKEHOLDER = "Stakeholder"
    DRIVER = "Driver"
    ASSESSMENT = "Assessment"
    GOAL = "Goal"
    OUTCOME = "Outcome"
    PRINCIPLE = "Principle"
    REQUIREMENT = "Requirement"
    CONSTRAINT = "Constraint"
    MEANING = "Meaning"
    VALUE = "Value"

    # Implementation & Migration Layer
    WORK_PACKAGE = "WorkPackage"
    DELIVERABLE = "Deliverable"
    IMPLEMENTATION_EVENT = "ImplementationEvent"
    PLATEAU = "Plateau"
    GAP = "Gap"

    # Composite / Grouping
    GROUPING = "Grouping"
    LOCATION = "Location"

class ArchimateElement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    layer: Layer
    type: ElementType
    attributes: Dict[str, Any] = Field(default_factory=dict)
    tags: Set[str] = Field(default_factory=set)

    class Config:
        use_enum_values = True

# --- Composite / Grouping ---
class Grouping(ArchimateElement):
    layer: Layer = Layer.COMPOSITE
    type: ElementType = ElementType.GROUPING

class Location(ArchimateElement):
    layer: Layer = Layer.COMPOSITE
    type: ElementType = ElementType.LOCATION

# --- Strategy Layer ---
class Resource(ArchimateElement):
    layer: Layer = Layer.STRATEGY
    type: ElementType = ElementType.RESOURCE

class Capability(ArchimateElement):
    layer: Layer = Layer.STRATEGY
    type: ElementType = ElementType.CAPABILITY

class CourseOfAction(ArchimateElement):
    layer: Layer = Layer.STRATEGY
    type: ElementType = ElementType.COURSE_OF_ACTION

class ValueStream(ArchimateElement):
    layer: Layer = Layer.STRATEGY
    type: ElementType = ElementType.VALUE_STREAM

# --- Business Layer ---

class BusinessActor(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_ACTOR

class BusinessRole(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_ROLE

class BusinessCollaboration(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_COLLABORATION

class BusinessInterface(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_INTERFACE

class BusinessProcess(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_PROCESS

class BusinessFunction(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_FUNCTION

class BusinessInteraction(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_INTERACTION

class BusinessEvent(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_EVENT

class BusinessService(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_SERVICE

class BusinessObject(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.BUSINESS_OBJECT

class Contract(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.CONTRACT

class Representation(ArchimateElement):
    layer: Layer = Layer.BUSINESS
    type: ElementType = ElementType.REPRESENTATION

class Product(ArchimateElement):
    layer: Layer = Layer.BUSINESS # Often composite but lives in Business often
    type: ElementType = ElementType.PRODUCT

# --- Application Layer ---

class ApplicationComponent(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_COMPONENT

class ApplicationCollaboration(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_COLLABORATION

class ApplicationInterface(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_INTERFACE

class ApplicationFunction(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_FUNCTION

class ApplicationInteraction(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_INTERACTION

class ApplicationProcess(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_PROCESS

class ApplicationEvent(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_EVENT

class ApplicationService(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.APPLICATION_SERVICE

class DataObject(ArchimateElement):
    layer: Layer = Layer.APPLICATION
    type: ElementType = ElementType.DATA_OBJECT

# --- Technology Layer ---

class Node(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.NODE

class Device(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.DEVICE

class SystemSoftware(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.SYSTEM_SOFTWARE

class TechnologyCollaboration(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.TECHNOLOGY_COLLABORATION

class TechnologyInterface(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.TECHNOLOGY_INTERFACE

class Path(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.PATH

class CommunicationNetwork(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.COMMUNICATION_NETWORK

class TechnologyFunction(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.TECHNOLOGY_FUNCTION

class TechnologyProcess(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.TECHNOLOGY_PROCESS

class TechnologyInteraction(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.TECHNOLOGY_INTERACTION

class TechnologyEvent(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.TECHNOLOGY_EVENT

class TechnologyService(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.TECHNOLOGY_SERVICE

class Artifact(ArchimateElement):
    layer: Layer = Layer.TECHNOLOGY
    type: ElementType = ElementType.ARTIFACT

# --- Physical Layer ---

class Facility(ArchimateElement):
    layer: Layer = Layer.PHYSICAL
    type: ElementType = ElementType.FACILITY

class Equipment(ArchimateElement):
    layer: Layer = Layer.PHYSICAL
    type: ElementType = ElementType.EQUIPMENT

class DistributionNetwork(ArchimateElement):
    layer: Layer = Layer.PHYSICAL
    type: ElementType = ElementType.DISTRIBUTION_NETWORK

class Material(ArchimateElement):
    layer: Layer = Layer.PHYSICAL
    type: ElementType = ElementType.MATERIAL

# --- Motivation Layer ---

class Stakeholder(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.STAKEHOLDER

class Driver(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.DRIVER

class Assessment(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.ASSESSMENT

class Goal(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.GOAL

class Outcome(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.OUTCOME

class Principle(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.PRINCIPLE

class Requirement(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.REQUIREMENT

class Constraint(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.CONSTRAINT

class Meaning(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.MEANING

class Value(ArchimateElement):
    layer: Layer = Layer.MOTIVATION
    type: ElementType = ElementType.VALUE

# --- Implementation & Migration Layer ---

class WorkPackage(ArchimateElement):
    layer: Layer = Layer.IMPLEMENTATION
    type: ElementType = ElementType.WORK_PACKAGE

class Deliverable(ArchimateElement):
    layer: Layer = Layer.IMPLEMENTATION
    type: ElementType = ElementType.DELIVERABLE

class ImplementationEvent(ArchimateElement):
    layer: Layer = Layer.IMPLEMENTATION
    type: ElementType = ElementType.IMPLEMENTATION_EVENT

class Plateau(ArchimateElement):
    layer: Layer = Layer.IMPLEMENTATION
    type: ElementType = ElementType.PLATEAU

class Gap(ArchimateElement):
    layer: Layer = Layer.IMPLEMENTATION
    type: ElementType = ElementType.GAP

