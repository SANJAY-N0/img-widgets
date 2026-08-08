import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import {
    ExtensionPreferences,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class DesktopPhotoPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Desktop Photo',
            icon_name: 'image-x-generic-symbolic',
        });

        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Desktop Image',
            description: 'Choose an image to display on your desktop.',
        });

        page.add(group);

        const currentPath = settings.get_string('image-path');

        const pathRow = new Adw.ActionRow({
            title: 'Selected Image',
            subtitle: currentPath || 'No image selected',
        });

        group.add(pathRow);

        const chooseButton = new Gtk.Button({
            label: 'Choose Image',
            valign: Gtk.Align.CENTER,
        });

        const chooseRow = new Adw.ActionRow({
            title: 'Desktop Image',
            subtitle: 'Select JPG, PNG or WebP',
        });

        chooseRow.add_suffix(chooseButton);
        chooseRow.set_activatable_widget(chooseButton);

        group.add(chooseRow);

        const clearButton = new Gtk.Button({
            label: 'Clear',
            valign: Gtk.Align.CENTER,
        });

        const clearRow = new Adw.ActionRow({
            title: 'Remove Image',
            subtitle: 'Remove the image from the desktop.',
        });

        clearRow.add_suffix(clearButton);

        group.add(clearRow);

        const changedId = settings.connect(
            'changed::image-path',
            () => {
                const path = settings.get_string('image-path');

                pathRow.set_subtitle(
                    path || 'No image selected'
                );
            }
        );

        window.connect('close-request', () => {
            settings.disconnect(changedId);
        });

        chooseButton.connect('clicked', () => {
            const dialog = new Gtk.FileDialog({
                title: 'Select Desktop Image',
            });

            const filter = new Gtk.FileFilter();

            filter.set_name('Images');

            filter.add_mime_type('image/jpeg');
            filter.add_mime_type('image/png');
            filter.add_mime_type('image/webp');

            const filters = new Gio.ListStore({
                item_type: Gtk.FileFilter,
            });

            filters.append(filter);

            dialog.set_filters(filters);

            dialog.open(window, null, (dialog, result) => {
                try {
                    const file = dialog.open_finish(result);

                    if (!file) {
                        return;
                    }

                    const path = file.get_path();

                    if (path) {
                        settings.set_string(
                            'image-path',
                            path
                        );
                    }

                } catch (error) {
                    // User cancelled the dialog.
                }
            });
        });

        clearButton.connect('clicked', () => {
            settings.set_string('image-path', '');
        });
    }
}