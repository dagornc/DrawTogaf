from typing import Dict, Type, Optional
from app.core.metamodel import (
    ArchimateElement, ElementType, Layer,
    # Strategy
    Resource, Capability, CourseOfAction, ValueStream,
    # Business
    BusinessActor, BusinessRole, BusinessCollaboration, BusinessInterface,
    BusinessProcess, BusinessFunction, BusinessInteraction, BusinessEvent,
    BusinessService, BusinessObject, Contract, Representation, Product,
    # Application
    ApplicationComponent, ApplicationCollaboration, ApplicationInterface,
    ApplicationFunction, ApplicationInteraction, ApplicationProcess,
    ApplicationEvent, ApplicationService, DataObject,
    # Technology
    Node, Device, SystemSoftware, TechnologyCollaboration, TechnologyInterface,
    Path, CommunicationNetwork, TechnologyFunction, TechnologyProcess,
    TechnologyInteraction, TechnologyEvent, TechnologyService, Artifact,
    # Physical
    Facility, Equipment, DistributionNetwork, Material,
    # Motivation
    Stakeholder, Driver, Assessment, Goal, Outcome, Principle,
    Requirement, Constraint, Meaning, Value,
    # Implementation
    WorkPackage, Deliverable, ImplementationEvent, Plateau, Gap,
    # Composite
    Grouping, Location
)

class ElementFactory:
    _mapping: Dict[str, Type[ArchimateElement]] = {
        # Strategy
        ElementType.RESOURCE.value: Resource,
        ElementType.CAPABILITY.value: Capability,
        ElementType.COURSE_OF_ACTION.value: CourseOfAction,
        ElementType.VALUE_STREAM.value: ValueStream,
        "Resource": Resource, "Capability": Capability, "CourseOfAction": CourseOfAction, "ValueStream": ValueStream,

        # Business
        ElementType.BUSINESS_ACTOR.value: BusinessActor,
        ElementType.BUSINESS_ROLE.value: BusinessRole,
        ElementType.BUSINESS_COLLABORATION.value: BusinessCollaboration,
        ElementType.BUSINESS_INTERFACE.value: BusinessInterface,
        ElementType.BUSINESS_PROCESS.value: BusinessProcess,
        ElementType.BUSINESS_FUNCTION.value: BusinessFunction,
        ElementType.BUSINESS_INTERACTION.value: BusinessInteraction,
        ElementType.BUSINESS_EVENT.value: BusinessEvent,
        ElementType.BUSINESS_SERVICE.value: BusinessService,
        ElementType.BUSINESS_OBJECT.value: BusinessObject,
        ElementType.CONTRACT.value: Contract,
        ElementType.REPRESENTATION.value: Representation,
        ElementType.PRODUCT.value: Product,
        "BusinessActor": BusinessActor, "BusinessRole": BusinessRole, "BusinessCollaboration": BusinessCollaboration,
        "BusinessInterface": BusinessInterface, "BusinessProcess": BusinessProcess, "BusinessFunction": BusinessFunction,
        "BusinessInteraction": BusinessInteraction, "BusinessEvent": BusinessEvent, "BusinessService": BusinessService,
        "BusinessObject": BusinessObject, "Contract": Contract, "Representation": Representation, "Product": Product,

        # Application
        ElementType.APPLICATION_COMPONENT.value: ApplicationComponent,
        ElementType.APPLICATION_COLLABORATION.value: ApplicationCollaboration,
        ElementType.APPLICATION_INTERFACE.value: ApplicationInterface,
        ElementType.APPLICATION_FUNCTION.value: ApplicationFunction,
        ElementType.APPLICATION_INTERACTION.value: ApplicationInteraction,
        ElementType.APPLICATION_PROCESS.value: ApplicationProcess,
        ElementType.APPLICATION_EVENT.value: ApplicationEvent,
        ElementType.APPLICATION_SERVICE.value: ApplicationService,
        ElementType.DATA_OBJECT.value: DataObject,
        "ApplicationComponent": ApplicationComponent, "ApplicationCollaboration": ApplicationCollaboration,
        "ApplicationInterface": ApplicationInterface, "ApplicationFunction": ApplicationFunction,
        "ApplicationInteraction": ApplicationInteraction, "ApplicationProcess": ApplicationProcess,
        "ApplicationEvent": ApplicationEvent, "ApplicationService": ApplicationService, "DataObject": DataObject,

        # Technology
        ElementType.NODE.value: Node,
        ElementType.DEVICE.value: Device,
        ElementType.SYSTEM_SOFTWARE.value: SystemSoftware,
        ElementType.TECHNOLOGY_COLLABORATION.value: TechnologyCollaboration,
        ElementType.TECHNOLOGY_INTERFACE.value: TechnologyInterface,
        ElementType.PATH.value: Path,
        ElementType.COMMUNICATION_NETWORK.value: CommunicationNetwork,
        ElementType.TECHNOLOGY_FUNCTION.value: TechnologyFunction,
        ElementType.TECHNOLOGY_PROCESS.value: TechnologyProcess,
        ElementType.TECHNOLOGY_INTERACTION.value: TechnologyInteraction,
        ElementType.TECHNOLOGY_EVENT.value: TechnologyEvent,
        ElementType.TECHNOLOGY_SERVICE.value: TechnologyService,
        ElementType.ARTIFACT.value: Artifact,
        "Node": Node, "Device": Device, "SystemSoftware": SystemSoftware, "TechnologyCollaboration": TechnologyCollaboration,
        "TechnologyInterface": TechnologyInterface, "Path": Path, "CommunicationNetwork": CommunicationNetwork,
        "TechnologyFunction": TechnologyFunction, "TechnologyProcess": TechnologyProcess, "TechnologyInteraction": TechnologyInteraction,
        "TechnologyEvent": TechnologyEvent, "TechnologyService": TechnologyService, "Artifact": Artifact,

        # Physical
        ElementType.FACILITY.value: Facility,
        ElementType.EQUIPMENT.value: Equipment,
        ElementType.DISTRIBUTION_NETWORK.value: DistributionNetwork,
        ElementType.MATERIAL.value: Material,
        "Facility": Facility, "Equipment": Equipment, "DistributionNetwork": DistributionNetwork, "Material": Material,

        # Motivation
        ElementType.STAKEHOLDER.value: Stakeholder,
        ElementType.DRIVER.value: Driver,
        ElementType.ASSESSMENT.value: Assessment,
        ElementType.GOAL.value: Goal,
        ElementType.OUTCOME.value: Outcome,
        ElementType.PRINCIPLE.value: Principle,
        ElementType.REQUIREMENT.value: Requirement,
        ElementType.CONSTRAINT.value: Constraint,
        ElementType.MEANING.value: Meaning,
        ElementType.VALUE.value: Value,
        "Stakeholder": Stakeholder, "Driver": Driver, "Assessment": Assessment, "Goal": Goal, "Outcome": Outcome,
        "Principle": Principle, "Requirement": Requirement, "Constraint": Constraint, "Meaning": Meaning, "Value": Value,

        # Implementation
        ElementType.WORK_PACKAGE.value: WorkPackage,
        ElementType.DELIVERABLE.value: Deliverable,
        ElementType.IMPLEMENTATION_EVENT.value: ImplementationEvent,
        ElementType.PLATEAU.value: Plateau,
        ElementType.GAP.value: Gap,
        "WorkPackage": WorkPackage, "Deliverable": Deliverable, "ImplementationEvent": ImplementationEvent,
        "Plateau": Plateau, "Gap": Gap,

        # Composite
        ElementType.GROUPING.value: Grouping,
        ElementType.LOCATION.value: Location,
        "Grouping": Grouping, "Location": Location,
    }

    @classmethod
    def create_element(cls, el_type: str, name: str, description: str = "") -> Optional[ArchimateElement]:
        element_cls = cls._mapping.get(el_type)
        if element_cls:
            return element_cls(name=name, description=description)
        return None
