//アクター
export class Actor extends g.FilledRect {
	public turn: () => void;
	public levelUp: () => void;
	public speed = 0;
	public level = 1;
	public isPlayer = true;

	constructor(pram: g.FilledRectParameterObject, isPlayer: boolean) {
		super(pram);

		this.isPlayer = isPlayer;

		new g.FilledRect({
			scene: this.scene,
			x: (10 - 80) / 2,
			y: 0,
			width: 80,
			height: 120,
			cssColor: isPlayer ? "white" : "red",
			parent: this,
		});

		const spr = new g.FrameSprite({
			scene: this.scene,
			src: this.scene.asset.getImageById("actor"),
			x: 10 / 2,
			y: -80,
			width: 200,
			height: 200,
			frames: [14, 15],
			parent: this,
			interval: 300,
			anchorX: 0.5,
			anchorY: 0,
		});
		spr.start();

		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: "monospace",
			size: 24,
		});

		const label = new g.Label({
			scene: this.scene,
			font: font,
			fontSize: 30,
			text: "" + this.level,
			parent: this,
		});

		this.levelUp = () => {
			this.level += 1;
			label.text = "" + this.level;
			label.invalidate();
		};

		this.turn = () => {
			this.speed = -this.speed;
			spr.scaleX = -spr.scaleX;
			spr.modified();
		};
	}
}
