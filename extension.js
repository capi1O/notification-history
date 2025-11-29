const Calendar = imports.ui.calendar;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

let _original;

var Urgency =
[
	"Low",
	"Normal",
	"High",
	"Critical"
];

function getPath()
{
	return GLib.get_home_dir() + "/.notifications/";
}

function _onNotificationAdded(source, notification)
{
	_original.apply(this, [source, notification]);

	let path = getPath();

	let date = new Date();
	let filename = path + date.toISOString().slice(0,10) + ".log";

	let file = Gio.file_new_for_path(filename);
	let fstream = file.append_to(Gio.FileCreateFlags.NONE, null);

	let datetime = notification.datetime.format("%H:%M:%S");
	let banners = source.policy.showBanners ? "Shown" : "Hidden";
	let urgency = Urgency[notification.urgency];
	let data = datetime + "|" + banners + "|" + urgency + "|" + notification.title + "|" + notification.bannerBodyText;
	data = data.replace("\\", "\\\\")/*.replace("\n", "\\n")*/ + "\n";
	fstream.write(data, null, data.length);

	fstream.close(null);
}

function init()
{
	_original = Calendar.NotificationSection.prototype._onNotificationAdded;
}

function enable()
{
	let path = getPath();

	if (!GLib.file_test(path, GLib.FileTest.IS_DIR))
			GLib.mkdir_with_parents(path, 0o755);
	else
	{
				// remove any old files ... TODO

//        let dir = Gio.File.new_for_path(path);
//        const children = dir.enumerate_children('standard::name', Gio.FileQueryInfoFlags.NONE, null);

//        let info, files = [];
//        while ((info = children.next_file(null)))
//            if (info.get_file_type() == Gio.FileType.REGULAR && !info.get_is_hidden())
//                files.push(dir.get_child(info.get_name()).get_parse_name());

//        files.sort((a, b) => new Date(a) - new Date(b));

//        for (let i = 0; i < files.length; i++)
//            if (date - new Date(files[i]) > 365 * 24 * 60 * 60 * 1000)
//                GLib.unlink(files[i]);
	}

	Calendar.NotificationSection.prototype._onNotificationAdded = _onNotificationAdded;
}

function disable()
{
	Calendar.NotificationSection.prototype._onNotificationAdded = _original;
}
