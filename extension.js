import St from 'gi://St';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class DesktopPhotoExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        this._photoActor = null;

        this._settingsChangedId = this._settings.connect(
            'changed::image-path',
            () => {
                this._updatePhoto();
            }
        );

        this._updatePhoto();
    }

    disable() {
        if (this._settingsChangedId) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        this._removePhoto();

        this._settings = null;
    }

    _updatePhoto() {
        this._removePhoto();

        const imagePath = this._settings.get_string('image-path');

        if (!imagePath) {
            return;
        }

        this._showPhoto(imagePath);
    }

    _showPhoto(imagePath) {
        const escapedPath = this._escapeCssUrl(imagePath);

        this._photoActor = new St.Widget({
            reactive: false,
            can_focus: false,
            track_hover: false,
            style: `
                background-image: url("file://${escapedPath}");
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
            `,
        });

        Main.layoutManager.backgroundGroup.add_child(this._photoActor);

        this._updateSize();
    }

    _updateSize() {
        if (!this._photoActor) {
            return;
        }

        const monitor = Main.layoutManager.primaryMonitor;

        this._photoActor.set_position(
            monitor.x,
            monitor.y
        );

        this._photoActor.set_size(
            monitor.width,
            monitor.height
        );
    }

    _removePhoto() {
        if (this._photoActor) {
            this._photoActor.destroy();
            this._photoActor = null;
        }
    }

    _escapeCssUrl(path) {
        return path
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    }
}