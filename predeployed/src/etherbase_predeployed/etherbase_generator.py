'''Module for generaration of Etherbase predeployed smart contract'''

from os.path import dirname, join
from typing import Dict
from web3.auto import w3

from predeployed_generator.openzeppelin.access_control_enumerable_generator \
    import AccessControlEnumerableGenerator


class EtherbaseGenerator(AccessControlEnumerableGenerator):
    '''Generates Etherbase
    '''

    ARTIFACT_FILENAME = 'Etherbase.json'
    DEFAULT_ADMIN_ROLE = (0).to_bytes(32, 'big')
    ETHER_MANAGER_ROLE = w3.solidityKeccak(['string'], ['ETHER_MANAGER_ROLE'])

    # ---------- storage ----------
    # -----Context------
    # ------ERC165------
    # --AccessControl---
    # 0:  _roles
    # AccessControlEnumerable
    # 1:  _roleMembers
    # ----------Etherbase----------


    ROLES_SLOT = 0
    ROLE_MEMBERS_SLOT = AccessControlEnumerableGenerator.next_slot(ROLES_SLOT)

    def __init__(self):
        generator = EtherbaseGenerator.from_hardhat_artifact(join(
            dirname(__file__),
            'artifacts',
            self.ARTIFACT_FILENAME))
        super().__init__(bytecode=generator.bytecode)

    @classmethod
    def generate_storage(cls, **kwargs) -> Dict[str, str]:
        schain_owner = kwargs['schain_owner']
        storage: Dict[str, str] = {}
        roles_slots = cls.RolesSlots(roles=cls.ROLES_SLOT, role_members=cls.ROLE_MEMBERS_SLOT)
        cls._setup_role(storage, roles_slots, cls.DEFAULT_ADMIN_ROLE, [schain_owner])
        cls._setup_role(storage, roles_slots, cls.ETHER_MANAGER_ROLE, [schain_owner])
        return storage