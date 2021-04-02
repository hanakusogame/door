import { Door } from "./Door";
import { MainScene } from "./MainScene";

//アクター
export class Actor extends g.E {
	public turn: () => void;
	public levelUp: () => void;
	public init: () => void;
	public speed = 0;
	public muki = 1;
	public level = 1;
	public isPlayer = true;
	public isStop = false;
	public spr: g.FrameSprite;
	public collisionArea: g.E;
	public door: Door;
	public collision: (actor: Actor) => boolean;

	constructor(pram: g.EParameterObject, isPlayer: boolean) {
		super(pram);

		this.isPlayer = isPlayer;
		const scene = g.game.scene() as MainScene;

		//当たり判定用
		this.collisionArea = new g.E({
			scene: this.scene,
			x: (10 - 80) / 2,
			y: 0,
			width: 80,
			height: 120,
			//cssColor: isPlayer ? "white" : "red",
			parent: this,
		});

		new g.Sprite({
			scene: scene,
			src: scene.asset.getImageById("shadow"),
			x: 10 / 2,
			y: 120,
			anchorX: 0.5,
			anchorY: 0.5,
			parent: this,
		});

		const spr = new g.FrameSprite({
			scene: scene,
			src: scene.asset.getImageById("actor"),
			x: 10 / 2,
			y: -80 + 100,
			width: 250,
			height: 250,
			frames: isPlayer ? [0, 1] : [4, 5],
			parent: this,
			interval: 300,
			anchorX: 0.5,
			anchorY: 0.55,
		});
		this.spr = spr;
		spr.start();

		const sprLevel = new g.Sprite({
			scene: scene,
			src: scene.asset.getImageById("level"),
			x: -60,
			y: -70,
			parent: this,
		});

		const label = new g.Label({
			scene: scene,
			font: scene.font,
			x: 50,
			y: 0,
			fontSize: 28,
			text: "" + this.level,
			parent: sprLevel,
		});

		//レベルアップ
		this.levelUp = () => {
			this.level += 1;
			this.speed += 0.2;
			label.text = "" + this.level;
			label.invalidate();
			if (this.level % 5 === 0 && this.level <= 25 && !isPlayer) {
				const num = (this.level / 5) * 2 + 4;
				spr.frames = [num, num + 1];
				sprLevel.y -= 10;
				sprLevel.modified();
			}
		};

		//反転
		this.turn = () => {
			this.muki = -this.muki;
			spr.scaleX = -spr.scaleX;
			spr.modified();
		};

		//初期化
		this.init = () => {
			spr.frames = [4, 5];
			spr.frameNumber = 0;
			spr.modified();
			this.level = 0;
			this.speed = 3;

			sprLevel.y = -70;
			sprLevel.modified();

			this.levelUp();
			this.modified();
		};

		//当たり判定
		this.collision = (actor: Actor): boolean => {
			const c1 = actor.collisionArea;
			const p1 = actor.collisionArea.localToGlobal({ x: 0, y: 0 });

			const c2 = this.collisionArea;
			const p2 = this.collisionArea.localToGlobal({ x: 0, y: 0 });

			return g.Collision.intersect(p1.x, p1.y, c1.width, c1.height, p2.x, p2.y, c1.width, c2.height);
		};
	}
}
