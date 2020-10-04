import React, { FunctionComponent, useCallback } from 'react';
import { remote } from 'electron';
import TitleBar from 'frameless-titlebar';
import { MenuItem } from 'frameless-titlebar/dist/title-bar/typings';
import { version } from '../../../package.json';
import rungame from '../../util/rungame';

const currentWindow = remote.getCurrentWindow();

const Menu: FunctionComponent = () => {
  const buttonCallback = useCallback<(menu: MenuItem) => void>((menu) => {
    if (menu.id === 'game-run') {
      rungame();
    }
  }, []);

  return (
    <>
      <TitleBar
        iconSrc={require('../../assets/loud.ico')}
        currentWindow={currentWindow}
        platform={process.platform as any}
        menu={[
          {
            label: 'Game',
            click: buttonCallback,
            submenu: [
              {
                id: 'game-run',
                label: 'Run game',
                click: buttonCallback,
              },
            ],
          },
        ]}
        title={`LOUD Supreme Commander Forged Alliance Updater & Game Launcher -- Version ${version}`}
        onClose={() => remote.app.quit()}
        onMinimize={() => currentWindow.minimize()}
        onMaximize={() => currentWindow.setSize(960, 644)}
        onDoubleClick={() => currentWindow.maximize()}
      ></TitleBar>
    </>
  );
};

export default Menu;
