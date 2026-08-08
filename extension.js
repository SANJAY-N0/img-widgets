import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

export default class DesktopPhotoExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._container = null;

        this._settingsHandler = this._settings.connect(
            'changed::image-path',
            () => this._updateWidget()
        );

        this._updateWidget();
        console.log('[Desktop Photo Widget] Extension enabled.');
    }

    disable() {
        if (this._settingsHandler && this._settings) {
            this._settings.disconnect(this._settingsHandler);
            this._settingsHandler = null;
        }

        this._settings = null;
        this._destroyWidget();
        console.log('[Desktop Photo Widget] Extension disabled.');
    }

    _destroyWidget() {
        if (this._container) {
            const parent = this._container.get_parent();
            if (parent) {
                parent.remove_child(this._container);
            }
            this._container.destroy();
            this._container = null;
        }
    }

    _updateWidget() {
        this._destroyWidget();

        const imagePath = this._settings.get_string('image-path');

        if (!imagePath || imagePath.trim() === '') {
            console.log('[Desktop Photo Widget] No image path selected yet.');
            return;
        }

        const file = Gio.File.new_for_path(imagePath);
        if (!file.query_exists(null)) {
            console.log(`[Desktop Photo Widget] File missing at path: ${imagePath}`);
            return;
        }

        try {
            this._container = new St.Bin({
                name: 'desktop-photo-container',
                style_class: 'desktop-photo-bin',
                x: 20,
                y: 20,
                width: 300,
                height: 300,
                reactive: false,
                can_focus: false,
            });

            const textureCache = St.TextureCache.get_default();
            const imageActor = textureCache.load_file_async(
                file,
                300,
                300,
                1,
                1.0
            );

            imageActor.set_x_align(Clutter.ActorAlign.CENTER);
            imageActor.set_y_align(Clutter.ActorAlign.CENTER);

            this._container.set_child(imageActor);

            if (Main.layoutManager.backgroundGroup) {
                Main.layoutManager.backgroundGroup.add_child(this._container);
                console.log(`[Desktop Photo Widget] Photo rendered: ${imagePath}`);
            } else {
                console.error('[Desktop Photo Widget] backgroundGroup unavailable.');
            }
        } catch (err) {
            console.error(`[Desktop Photo Widget] Render error: ${err.message}`);
            this._destroyWidget();
        }
    }
}
