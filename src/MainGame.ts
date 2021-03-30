import { Actor } from "./Actor";
import { Door } from "./Door";
import { MainScene } from "./MainScene";

//ゲームクラス
export class MainGame extends g.E {
	constructor() {
		const scene = g.game.scene() as MainScene;
		super({ scene: scene, width: g.game.width, height: g.game.height, touchable: true });

		// ベース
		const base = new g.E({
			scene: scene,
			x: 60,
			width: 1000,
			height: 720,
			parent: this,
		});

		// 床
		const floors: g.E[] = [];
		for (let y = 0; y < 3; y++) {
			floors[y] = new g.E({
				scene: scene,
				x: (3 - y) * 30,
				y: 200 * y + 100 + 150,
				width: 1000,
				height: 20,
				parent: base,
			});

			new g.Sprite({
				scene: scene,
				x: -50,
				y: -30,
				src: scene.asset.getImageById("floor"),
				parent: floors[y],
			});
		}

		// ドア
		const colors = ["pink", "yellow", "green", "cyan", "blue"];
		const doors: Door[] = [];
		let count = 0;
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				const door = new Door(scene, 300 * x + 130 - ((3 - y) * -30), 200 * y + 60, count, colors[count % 5]);
				base.append(door);
				doors[count] = door;
				// タップイベント
				const i = count;
				door.onPointDown.add(() => {
					door.isOpen = !door.isOpen;
					const doorExit = i !== 4 ? doors[(i + 5) % (Math.round(doors.length / 2) * 2)] : null; //出口
					if (door.isOpen) {
						door.open();
						doorExit?.open();
					} else {
						door.close();
						doorExit?.close();
					}
				});
				count++;
			}
		}

		// キャラクター
		const actors: Actor[] = [];

		// プレイヤー
		const player = new Actor(
			{
				scene: scene,
				x: (floors[1].width - 10) / 2,
				y: floors[1].y - 120,
				width: 10,
				height: 120,
				cssColor: "white",
				parent: base,
			},
			true
		);
		player.speed = 4;
		actors.push(player);

		// 敵
		for (let i = 0; i < 4; i++) {
			const num = g.game.random.generate();
			const j = Math.floor(g.game.random.generate() * floors.length);
			const actor = new Actor(
				{
					scene: scene,
					x: floors[0].width * num,
					y: floors[j].y - 120,
					width: 10,
					height: 120,
					cssColor: "red",
					parent: base,
				},
				false
			);
			actor.speed = 3;
			actors.push(actor);
		}

		// a が　b を倒す
		const killActor = (a: Actor, b: Actor): void => {
			if (!b.isPlayer) {
				a.levelUp();
				b.remove();
			}

			if (a.isPlayer) {
				scene.addScore(b.level ** 2 * 50);
			}
			return;
		};

		// キャラクター
		actors.forEach((actorA) => {
			actorA.onUpdate.add(() => {
				// 当たり判定
				actors.forEach((actorB) => {
					if (actorB !== actorA && actorA.parent && actorB.parent && g.Collision.intersectAreas(actorB, actorA)) {
						// レベルが高い方を残す
						if (actorA.level < actorB.level) {
							killActor(actorB, actorA);
						} else {
							killActor(actorA, actorB);
						}
					}
				});
			});
		});

		// メインループ
		this.onUpdate.add(() => {
			// ドアとの接触
			actors.forEach((actor) => {
				if (actor.parent) {
					// 生きている

					//ドアに入る
					doors.forEach((door, i) => {
						if (g.Collision.intersectAreas(door, actor) && door.isOpen) {
							const num = (i + 5) % (doors.length + (doors.length % 2));
							const doorNext = i !== 4 ? doors[num] : doors[g.game.random.get(0, 8)];
							actor.x = doorNext.x + (doorNext.width - actor.width) / 2;
							actor.y = doorNext.y + (doorNext.height - actor.height);
							actor.modified();

							door.close();
							doorNext.close();

							return;
						}
					});

					// 方向転換
					const left = actor.speed > 0 && actor.x > base.width - actor.width;
					const right = actor.speed < 0 && actor.x < 0;
					if (left || right) actor.turn();
					actor.x += actor.speed;
					actor.modified();
				} else {
					// 死んでいる 場合復活
					base.append(actor);
					const x = g.game.random.generate() < 0.5 ? 0 : floors[0].width;
					const floorNum = Math.floor(g.game.random.generate() * floors.length);
					const y = floors[floorNum].y - actor.height;
					actor.x = x;
					actor.y = y;
					actor.level = 0;
					actor.levelUp();
					actor.modified();
				}
			});

			return;
		});
	}
}
