import json
import shutil
from os.path import normpath, join, dirname

pkg_name = 'etherbase_predeployed'
package_artifacts_path = normpath(join(dirname(__file__), f'../src/{pkg_name}/artifacts'))


def get_build_info_path(artifacts_dir, contract_name):
    with open(join(artifacts_dir, f'{contract_name}.dbg.json')) as dbg_file:
        dbg = json.loads(dbg_file.read())
        return normpath(join(artifacts_dir, dbg['buildInfo']))


def get_artifacts_dir(contract_name):
    return normpath(join(dirname(__file__), '../../artifacts/', 'contracts', f'{contract_name}.sol'))


def generate(contract_name):
    artifacts_dir = get_artifacts_dir(contract_name)
    build_info_path = get_build_info_path(artifacts_dir, contract_name)
    with open(build_info_path) as info_file:
        info = json.loads(info_file.read())
        meta_data = {
            'name': contract_name,
            'solcVersion': info['solcVersion'],
            'solcLongVersion': info['solcLongVersion'],
            'input': info['input']
        }
    with open(join(package_artifacts_path, f'{contract_name}.meta.json'), 'w') as meta:
        meta.write(json.dumps(meta_data, indent=4))
    shutil.copy(join(artifacts_dir, f'{contract_name}.json'), package_artifacts_path)


if __name__ == '__main__':
    generate('Etherbase')
    generate('EtherbaseUpgradeable')
