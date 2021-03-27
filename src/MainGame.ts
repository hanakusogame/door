import { MainScene } from "./MainScene";

//ゲームクラス
export class MainGame extends g.E {
	constructor() {
		const scene = g.game.scene() as MainScene;
		super({ scene: scene, width: g.game.width, height: g.game.height, touchable: true });

		// ベース
		const base = new g.E({
			scene: scene,
			x: 20,
			width: 1000,
			height: 720,
			parent: this,
		});

		// ドア
		const doors: Door[] = [];
		let count = 0;
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				doors[count] = new Door(scene, 300 * x + 150, 200 * y + 100, count);
				base.append(doors[count]);
				count++;
			}
		}

		// 床
		const floors: g.FilledRect[] = [];
		for (let y = 0; y < 3; y++) {
			floors[y] = new g.FilledRect({
				scene: scene,
				x: 0,
				y: 200 * y + 100 + 150,
				width: 1000,
				height: 20,
				cssColor: "white",
				parent: base,
			});
		}

		// プレイヤー
		const player = new g.FilledRect({
			scene: scene,
			x: (floors[1].width - 80) / 2,
			y: floors[1].y - 120,
			width: 80,
			height: 120,
			cssColor: "white",
			parent: base,
		});

		// メインループ
		let speed = 3;
		this.onUpdate.add(() => {
			// ドアとの接触
			doors.forEach((door, i) => {
				if (g.Collision.intersectAreas(door, player) && door.isOpen) {
					const num = (i + 5) % (doors.length + (doors.length % 2));
					player.x = doors[num].x;
					player.y = doors[num].y;
					player.modified();

					return;
				}
			});

			// 方向転換
			const left = speed > 0 && player.x > base.width - player.width;
			const right = speed < 0 && player.x < 0;
			if (left || right) speed = -speed;
			player.x += speed;
			player.modified();
			return;
		});
	}
}

//ドアクラス
class Door extends g.FilledRect {
	public isOpen = false;
	public num = 0;
	constructor(scene: g.Scene, x: number, y: number, num: number) {
		super({
			scene: scene,
			x: x,
			y: y,
			width: 100,
			height: 150,
			cssColor: "white",
			touchable: true,
		});

		this.num = num;

		const colors = ["pink", "yellow", "green", "cyan", "blue"];

		new g.FilledRect({
			scene: scene,
			x: 5,
			y: 5,
			width: 100 - 10,
			height: 150 - 10,
			cssColor: "black",
			parent: this,
		});

		const spr = new g.FilledRect({
			scene: scene,
			x: 5,
			y: 5,
			width: 100 - 10,
			height: 150 - 10,
			cssColor: colors[num % 5],
			parent: this,
		});

		// タップイベント
		this.onPointDown.add(() => {
			this.isOpen = !this.isOpen;
			spr.scaleX = this.isOpen ? -0.5 : 1;
			spr.modified();
		});
	}
}
