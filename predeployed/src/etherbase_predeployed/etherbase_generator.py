'''Module for generaration of Etherbase predeployed smart contract'''

from os.path import dirname, join
from typing import Dict
from web3.auto import w3

from predeployed_generator.openzeppelin.access_control_enumerable_generator \
    import AccessControlEnumerableGenerator
from predeployed_generator.upgradeable_contract_generator import UpgradeableContractGenerator


class EtherbaseGenerator(AccessControlEnumerableGenerator):
    '''Generates non upgradeable instance of Etherbase
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
        generator = EtherbaseGenerator.from_hardhat_artifact(join(
            dirname(__file__),
            'artifacts',
            self.ARTIFACT_FILENAME))
        super().__init__(bytecode=generator.bytecode, abi=generator.abi)

    @classmethod
    def generate_storage(cls, **kwargs) -> Dict[str, str]:
        '''Generate contract storage

        Required arguments:
            - schain_owner - address of schain owner

        Optional arguments:
            - ether_managers - list of addresses that must be granted with ETHER_MANAGER_ROLE
        '''
        schain_owner = kwargs['schain_owner']
        ether_managers = kwargs.get('ether_managers', [])

        assert isinstance(schain_owner, str)
        assert isinstance(ether_managers, list)
        for item in ether_managers:
            assert isinstance(item, str)

        if schain_owner not in ether_managers:
            ether_managers.append(schain_owner)
        storage: Dict[str, str] = {}
        cls._write_uint256(storage, cls.INITIALIZED_SLOT, 1)
        roles_slots = cls.RolesSlots(roles=cls.ROLES_SLOT, role_members=cls.ROLE_MEMBERS_SLOT)
        cls._setup_role(storage, roles_slots, cls.DEFAULT_ADMIN_ROLE, [schain_owner])
        cls._setup_role(storage, roles_slots, cls.ETHER_MANAGER_ROLE, ether_managers)
        return storage


class UpgradeableEtherbaseGenerator(UpgradeableContractGenerator):
    '''Generates upgradeable instance of EtherbaseUpgradeable
    '''

    def __init__(self):
        super().__init__(implementation_generator=EtherbaseUpgradeableGenerator())
