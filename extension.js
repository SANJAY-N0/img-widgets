import St from 'gi://St';

import {
    Extension,
} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class DesktopPhotoExtension extends Extension {

    enable() {
        this._settings = this.getSettings();

        this._photo = null;

        this._settingsChangedId = this._settings.connect(
            'changed::image-path',
            () => {
                this._loadPhoto();
            }
        );

        this._monitorChangedId =
            Main.layoutManager.connect(
                'monitors-changed',
                () => {
                    this._positionPhoto();
                }
            );

        this._loadPhoto();
    }

    disable() {

        if (this._settingsChangedId) {
            this._settings.disconnect(
                this._settingsChangedId
            );

            this._settingsChangedId = null;
        }

        if (this._monitorChangedId) {
            Main.layoutManager.disconnect(
                this._monitorChangedId
            );

            this._monitorChangedId = null;
        }

        this._removePhoto();

        this._settings = null;
    }

    _loadPhoto() {

        this._removePhoto();

        const imagePath =
            this._settings.get_string('image-path');

        if (!imagePath) {
            console.log(
                '[Desktop Photo Widget] No image selected'
            );

            return;
        }

        console.log(
            `[Desktop Photo Widget] Loading image: ${imagePath}`
        );

        /*
         * Desktop widget size.
         */
        const SIZE = 160;

        this._photo = new St.Widget({
            width: SIZE,
            height: SIZE,

            reactive: false,
            can_focus: false,

            style: `
                background-image: url("file://${this._escapePath(imagePath)}");
                background-size: contain;
                background-position: center;
                background-repeat: no-repeat;
            `,
        });

        /*
         * Put the photo on the desktop.
         */
        Main.layoutManager.uiGroup.add_child(
            this._photo
        );

        this._positionPhoto();
    }

    _positionPhoto() {

        if (!this._photo) {
            return;
        }

        const monitor =
            Main.layoutManager.primaryMonitor;

        const width =
            this._photo.width;

        const height =
            this._photo.height;

        /*
         * CENTER OF SCREEN
         */
        const x =
            monitor.x +
            (monitor.width - width) / 2;

        const y =
            monitor.y +
            (monitor.height - height) / 2;

        this._photo.set_position(
            x,
            y
        );
    }

    _removePhoto() {

        if (this._photo) {
            this._photo.destroy();

            this._photo = null;
        }
    }

    _escapePath(path) {

        return path
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    }
}