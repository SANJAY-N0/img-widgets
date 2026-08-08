import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';

import {
    ExtensionPreferences,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class DesktopPhotoPreferences
    extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Desktop Photo',
        });

        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Desktop Image',
            description:
                'Select an image to display on your desktop.',
        });

        page.add(group);

        const selectedRow = new Adw.ActionRow({
            title: 'Selected Image',
            subtitle:
                settings.get_string('image-path') ||
                'No image selected',
        });

        group.add(selectedRow);

        const chooseButton = new Gtk.Button({
            label: 'Choose Image',
            valign: Gtk.Align.CENTER,
        });

        const chooseRow = new Adw.ActionRow({
            title: 'Choose Image',
            subtitle: 'JPG, JPEG, PNG or WebP',
        });

        chooseRow.add_suffix(chooseButton);
        group.add(chooseRow);

        const clearButton = new Gtk.Button({
            label: 'Clear',
            valign: Gtk.Align.CENTER,
        });

        const clearRow = new Adw.ActionRow({
            title: 'Remove Image',
            subtitle: 'Remove the current desktop image',
        });

        clearRow.add_suffix(clearButton);
        group.add(clearRow);

        const settingsId = settings.connect(
            'changed::image-path',
            () => {
                const path =
                    settings.get_string('image-path');

                selectedRow.set_subtitle(
                    path || 'No image selected'
                );
            }
        );

        window.connect('close-request', () => {
            settings.disconnect(settingsId);
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

            dialog.open(
                window,
                null,
                (dialog, result) => {
                    try {
                        const file =
                            dialog.open_finish(result);

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
                        console.log(
                            '[Desktop Photo Widget] File selection cancelled'
                        );
                    }
                }
            );
        });

        clearButton.connect('clicked', () => {
            settings.set_string(
                'image-path',
                ''
            );
        });
    }
}