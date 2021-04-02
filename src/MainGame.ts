import tl = require("@akashic-extension/akashic-timeline");
import { Actor } from "./Actor";
import { Door } from "./Door";
import { MainScene } from "./MainScene";

//ゲームクラス
export class MainGame extends g.E {
	constructor() {
		const scene = g.game.scene() as MainScene;
		super({ scene: scene, width: g.game.width, height: g.game.height, touchable: true });
		const timeline = new tl.Timeline(scene);

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
				y: 200 * y + 100 + 170,
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
				const door = new Door(scene, 300 * x + 130, -200, count, colors[count % 5]);
				floors[y].append(door);
				doors[count] = door;
				// タップイベント
				const i = count;
				door.onPointDown.add(() => {
					if (!scene.isStart) return;
					door.isOpen = !door.isOpen;
					const doorExit = i !== 4 ? doors[(i + 5) % (Math.round(doors.length / 2) * 2)] : null; //出口
					if (door.isOpen) {
						door.open();
						doorExit?.open();
					} else {
						door.close();
						doorExit?.close();
					}
					scene.playSound("se_miss");
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
				y: -120,
				width: 10,
				height: 120,
				parent: floors[1],
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
					y: -120,
					width: 10,
					height: 120,
					parent: floors[j],
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

				a.isStop = true;
				timeline
					.create(a)
					.scaleTo(1.3, 1.3, 300)
					.scaleTo(1.0, 1.0, 300)
					.call(() => {
						a.isStop = false;
					});

				if (!a.isPlayer) {
					scene.playSound("se_move");
				}
			}

			//プレイヤーが倒した時
			if (a.isPlayer) {
				//エフェクト作成
				const effect = new g.FrameSprite({
					scene: scene,
					src: scene.asset.getImageById("effect"),
					x: b.x,
					y: b.y,
					scaleX: 2.0,
					scaleY: 2.0,
					width: 120,
					height: 120,
					anchorX: 0.5,
					anchorY: 0.5,
					frames: [0, 1, 2],
					interval: 200,
					parent: a.parent,
				});
				effect.start();
				a.isStop = true;

				//回転斬り
				timeline.create(a.spr).rotateTo(360 * a.muki, 300);

				setTimeout(() => {
					effect.destroy();
					a.isStop = false;
					a.spr.angle = 0;
					a.spr.modified();
				}, 1000);

				scene.addScore(b.level ** 2 * 120);

				scene.playSound("se_clear");
			}
			return;
		};

		// キャラクター
		actors.forEach((actorA) => {
			actorA.onUpdate.add(() => {
				if (!scene.isStart) return;
				// 当たり判定
				actors.forEach((actorB) => {
					if (actorB !== actorA && actorA.parent && actorB.parent
						&& actorA.parent === actorB.parent && actorA.collision(actorB)) {
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
				// 生きている
				if (actor.parent) {
					if (actor.isStop) return;


					let isDoor = false;//連打防止(なぜかUターンまで可能)

					//ドアに入る
					doors.forEach((door, i) => {
						if (door.parent === actor.parent && g.Collision.intersectAreas(door, actor)) {
							if (door.isOpen && !actor.door) {
								const num = (i + 5) % (doors.length + (doors.length % 2));
								const doorNext = i !== 4 ? doors[num] : doors[g.game.random.get(0, 8)];
								actor.x = doorNext.x + (doorNext.width - actor.width) / 2;
								doorNext.parent.append(actor);
								actor.modified();
								actor.door = door;

								door.close();
								doorNext.close();
								return;
							}
							isDoor = true;
						}
					});

					if (!isDoor) actor.door = null;

					// 方向転換
					const left = actor.muki > 0 && actor.x > base.width - actor.width;
					const right = actor.muki < 0 && actor.x < 0;
					if (left || right) actor.turn();

					//移動
					actor.x += actor.speed * actor.muki;
					actor.modified();
				} else {
					// 死んでいる 場合復活
					const x = g.game.random.generate() < 0.5 ? -100 : floors[0].width + 100;
					const floorNum = Math.floor(g.game.random.generate() * floors.length);
					floors[floorNum].append(actor);
					actor.x = x;
					actor.init();
				}
			});

			return;
		});
	}
}
