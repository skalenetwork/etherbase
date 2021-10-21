from os.path import dirname, join
from typing import Dict
from web3.auto import w3

from predeployed_generator.upgradeable_contract_generator import UpgradeableContractGenerator
from predeployed_generator.openzeppelin.access_control_enumerable_generator \
    import AccessControlEnumerableGenerator


class EtherbaseUpgradeableGenerator(AccessControlEnumerableGenerator):
    '''Generates EtherbaseUpgradeable
    '''

    ARTIFACT_FILENAME = 'EtherbaseUpgradeable.json'
    DEFAULT_ADMIN_ROLE = (0).to_bytes(32, 'big')
    ETHER_MANAGER_ROLE = w3.solidityKeccak(['string'], ['ETHER_MANAGER_ROLE'])

    # --------------- storage ---------------
    # ------------ Initializable ------------
    # 0:    _initialized, _initializing
    # --------- ContextUpgradeable ----------
    # 1:    __gap
    # ...   __gap
    # 50:   __gap
    # ---------- ERC165Upgradeable ----------
    # 51:   __gap
    # ...   __gap
    # 100:  __gap
    # ------- AccessControlUpgradeable -------
    # 101:  _roles
    # 102:  __gap
    # ...   __gap
    # 150:  __gap
    # -- AccessControlEnumerableUpgradeable --
    # 151:  _roleMembers
    # 152:  __gap
    # ...   __gap
    # 200:  __gap
    # --------- EtherbaseUpgradeable ---------


    INITIALIZED_SLOT = 0
    ROLES_SLOT = 101
    ROLE_MEMBERS_SLOT = 151

    def __init__(self):
        generator = EtherbaseUpgradeableGenerator.from_hardhat_artifact(join(
            dirname(__file__),
            'artifacts',
            self.ARTIFACT_FILENAME))
        super().__init__(bytecode=generator.bytecode)

    @classmethod
    def generate_storage(cls, **kwargs) -> Dict[str, str]:
        schain_owner = kwargs['schain_owner']
        storage: Dict[str, str] = {}
        cls._write_uint256(storage, cls.INITIALIZED_SLOT, 1)
        roles_slots = cls.RolesSlots(roles=cls.ROLES_SLOT, role_members=cls.ROLE_MEMBERS_SLOT)
        cls._setup_role(storage, roles_slots, cls.DEFAULT_ADMIN_ROLE, [schain_owner])
        cls._setup_role(storage, roles_slots, cls.ETHER_MANAGER_ROLE, [schain_owner])
        return storage


class UpgradeableEtherbaseUpgradeableGenerator(UpgradeableContractGenerator):
    def __init__(self):
        super().__init__(implementation_generator=EtherbaseUpgradeableGenerator())
