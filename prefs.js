import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class DesktopPhotoPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Desktop Photo Widget',
            description: 'Choose an image file to display on your desktop.',
        });
        page.add(group);

        const currentPath = settings.get_string('image-path');
        const pathRow = new Adw.ActionRow({
            title: 'Selected:',
            subtitle: currentPath || 'None',
        });

        const chooseButton = new Gtk.Button({
            label: 'Browse...',
            valign: Gtk.Align.CENTER,
        });

        const chooseRow = new Adw.ActionRow({
            title: 'Choose Image',
            subtitle: 'Supported formats: .jpg, .jpeg, .png, .webp',
        });

        chooseRow.add_suffix(chooseButton);
        chooseRow.set_activatable_widget(chooseButton);

        group.add(chooseRow);
        group.add(pathRow);

        const signalId = settings.connect('changed::image-path', () => {
            const updatedPath = settings.get_string('image-path');
            pathRow.set_subtitle(updatedPath || 'None');
        });

        window.connect('close-request', () => {
            settings.disconnect(signalId);
        });

        chooseButton.connect('clicked', () => {
            const fileDialog = new Gtk.FileDialog({
                title: 'Select Desktop Photo',
                modal: true,
            });

            const filter = new Gtk.FileFilter();
            filter.set_name('Supported Images (*.jpg, *.jpeg, *.png, *.webp)');
            filter.add_mime_type('image/jpeg');
            filter.add_mime_type('image/png');
            filter.add_mime_type('image/webp');
            filter.add_pattern('*.jpg');
            filter.add_pattern('*.jpeg');
            filter.add_pattern('*.png');
            filter.add_pattern('*.webp');

            const filterList = new Gio.ListStore({ item_type: Gtk.FileFilter });
            filterList.append(filter);
            fileDialog.set_filters(filterList);

            fileDialog.open(window, null, (dialog, result) => {
                try {
                    const selectedFile = dialog.open_finish(result);
                    if (selectedFile) {
                        const path = selectedFile.get_path();
                        if (path) {
                            settings.set_string('image-path', path);
                        }
                    }
                } catch (error) {
                    // Ignore user dialog dismissal
                }
            });
        });
    }
}
