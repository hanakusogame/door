import tl = require("@akashic-extension/akashic-timeline");
//ドアクラス
export class Door extends g.Sprite {
	public isOpen = false;
	public num = 0;
	public open: () => void;
	public close: () => void;
	constructor(scene: g.Scene, x: number, y: number, num: number, color: string) {
		super({
			scene: scene,
			x: x,
			y: y,
			width: 120,
			height: 160,
			src: scene.asset.getImageById("door_base"),
			srcX: 120 * (num % 5),
			touchable: true,
			scaleX: 1.2,
			scaleY: 1.2,
		});

		this.num = num;

		const timeline = new tl.Timeline(scene);

		const spr = new g.Sprite({
			scene: scene,
			x: 18,
			y: 0,
			width: 120,
			height: 160,
			src: scene.asset.getImageById("door"),
			srcX: 120 * (num % 5),
			anchorX: 18 / 120,
			anchorY: 0,
			parent: this,
		});

		this.open = () => {
			this.isOpen = true;
			timeline.create(spr).scaleTo(-0.5, 1.0, 200);
		};

		this.close = () => {
			this.isOpen = false;
			timeline.create(spr).scaleTo(1.0, 1.0, 200);
		};
	}
}
