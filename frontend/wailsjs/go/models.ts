export namespace config {
	
	export class RecentItem {
	    path: string;
	    name: string;
	    timestamp: string;
	
	    static createFrom(source: any = {}) {
	        return new RecentItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.name = source["name"];
	        this.timestamp = source["timestamp"];
	    }
	}
	export class Tile {
	    id: string;
	    name: string;
	    icon: string;
	    action: string;
	    target: string;
	    args?: string[];
	    workDir?: string;
	    hasSubMenu: boolean;
	    subMenuType?: string;
	    subMenuItems?: RecentItem[];
	    order: number;
	    enabled: boolean;
	    color?: string;
	
	    static createFrom(source: any = {}) {
	        return new Tile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.icon = source["icon"];
	        this.action = source["action"];
	        this.target = source["target"];
	        this.args = source["args"];
	        this.workDir = source["workDir"];
	        this.hasSubMenu = source["hasSubMenu"];
	        this.subMenuType = source["subMenuType"];
	        this.subMenuItems = this.convertValues(source["subMenuItems"], RecentItem);
	        this.order = source["order"];
	        this.enabled = source["enabled"];
	        this.color = source["color"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Config {
	    theme: string;
	    hotkey: string;
	    position: string;
	    animation: boolean;
	    blur: boolean;
	    startWithWindows: boolean;
	    checkForUpdatesOnStartup: boolean;
	    recentFoldersLimit: number;
	    recentFolders: string[];
	    tiles: Tile[];
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.theme = source["theme"];
	        this.hotkey = source["hotkey"];
	        this.position = source["position"];
	        this.animation = source["animation"];
	        this.blur = source["blur"];
	        this.startWithWindows = source["startWithWindows"];
	        this.checkForUpdatesOnStartup = source["checkForUpdatesOnStartup"];
	        this.recentFoldersLimit = source["recentFoldersLimit"];
	        this.recentFolders = source["recentFolders"];
	        this.tiles = this.convertValues(source["tiles"], Tile);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	

}

export namespace tray {
	
	export class Manager {
	
	
	    static createFrom(source: any = {}) {
	        return new Manager(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace updater {
	
	export class UpdateInfo {
	    available: boolean;
	    currentVersion: string;
	    latestVersion: string;
	    releaseUrl: string;
	    releaseNote: string;
	    assetUrl: string;
	    assetSize: number;
	
	    static createFrom(source: any = {}) {
	        return new UpdateInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.available = source["available"];
	        this.currentVersion = source["currentVersion"];
	        this.latestVersion = source["latestVersion"];
	        this.releaseUrl = source["releaseUrl"];
	        this.releaseNote = source["releaseNote"];
	        this.assetUrl = source["assetUrl"];
	        this.assetSize = source["assetSize"];
	    }
	}

}

export namespace version {
	
	export class Info {
	    version: string;
	    commit: string;
	    buildTime: string;
	
	    static createFrom(source: any = {}) {
	        return new Info(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.version = source["version"];
	        this.commit = source["commit"];
	        this.buildTime = source["buildTime"];
	    }
	}

}

