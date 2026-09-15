// Battery Test Scene — displays every battery icon (all 3 levels) in a grid.
// Loaded via batteryTest.html. Uses BATTERY_TYPES from batteryChargeData.js.
// Each row = one battery type, showing its levels left-to-right.

class BatteryTestScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BatteryTestScene' });

        // ── Layout knobs ──────────────────────────────────────────────
        this.ICON_SIZE = 100;     // each battery icon drawn at 100x100
        this.CELL_W = 200;        // horizontal space per icon (icon + gap)
        this.CELL_H = 140;        // vertical space per row (icon + label + gap)
        this.MARGIN_X = 30;       // left margin
        this.MARGIN_TOP = 40;     // top margin
        this.LABEL_SIZE = '14px';

        this.scrollY = 0;
        this.contentHeight = 0;
    }

    preload() {
        // Build one texture key per battery level from BATTERY_TYPES.
        // File names: display name → lowercase → spaces to underscores → _1/_2/_3
        this.rows = [];
        BATTERY_TYPES.forEach((type, typeIndex) => {
            const fileBase = type.name.toLowerCase().replace(/ /g, '_');
            const items = [];
            for (let pos = 1; pos <= type.count; pos++) {
                const key = `bt_${typeIndex}_${pos}`;
                const fileName = `${fileBase}_${pos}.png`;
                this.load.image(key, `../graphics/battery/${fileName}`);
                items.push({ key, fileName, label: `${type.name} ${pos}` });
            }
            this.rows.push(items);
        });

        // Track missing files so we can flag them instead of silently blanking.
        this.missing = new Set();
        this.load.on('loaderror', (file) => this.missing.add(file.key));
    }

    create() {
        this.cameras.main.setBackgroundColor('#f2efe9');

        this.container = this.add.container(0, 0);

        this.rows.forEach((items, rowIndex) => {
            const rowY = this.MARGIN_TOP + rowIndex * this.CELL_H + this.ICON_SIZE / 2;

            items.forEach((item, col) => {
                const x = this.MARGIN_X + col * this.CELL_W + this.CELL_W / 2;
                const y = rowY;

                if (this.textures.exists(item.key) && !this.missing.has(item.key)) {
                    const img = this.add.image(x, y, item.key);
                    const scale = this.ICON_SIZE / Math.max(img.width, img.height);
                    img.setScale(scale);
                    this.container.add(img);
                } else {
                    // Missing texture — mark with a red X.
                    const miss = this.add.text(x, y, 'X', {
                        fontFamily: 'Arial', fontSize: '48px', color: '#ff5555',
                    }).setOrigin(0.5);
                    this.container.add(miss);
                }

                const label = this.add.text(x, y + this.ICON_SIZE / 2 + 5, item.label, {
                    fontFamily: 'Arial', fontSize: this.LABEL_SIZE, color: '#333333',
                    align: 'center', wordWrap: { width: this.CELL_W },
                }).setOrigin(0.5, 0);
                this.container.add(label);
            });
        });

        this.contentHeight = this.MARGIN_TOP + this.rows.length * this.CELL_H + 40;

        // Header (fixed, outside scrolling container).
        const total = this.rows.reduce((n, r) => n + r.length, 0);
        this.add.text(this.MARGIN_X, 8, `Battery icons — ${total} total (scroll to see all)`, {
            fontFamily: 'Arial', fontSize: '16px', color: '#333333',
        }).setScrollFactor(0).setDepth(1000);

        // Scroll with mouse wheel / two-finger trackpad only.
        this.input.on('wheel', (pointer, over, dx, dy) => {
            this.scrollBy(dy);
        });
    }

    scrollBy(delta) {
        const viewH = this.scale.height;
        const maxScroll = Math.max(0, this.contentHeight - viewH);
        this.scrollY = Phaser.Math.Clamp(this.scrollY + delta, 0, maxScroll);
        this.container.y = -this.scrollY;
    }
}
