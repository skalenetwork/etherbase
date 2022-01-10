#!/usr/bin/env python
from etherbase_predeployed.etherbase_upgradeable_generator import EtherbaseUpgradeableGenerator
import json


def main():
    print(json.dumps(EtherbaseUpgradeableGenerator().get_abi(), sort_keys=True, indent=4))


if __name__ == '__main__':
    main()
