// Win Scene for Letter Spelling Game
// Displays when player spells the word correctly

class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
        
        // Random congratulatory messages
        this.winMessages = [
            'Boom!',
            'Nice!',
            'Perfect!',
            'Correct!',
            'Great Job!',
            'Well Done!',
            'Nailed It!',
            'Awesome!',
            'Brilliant!',
            'Cool!',
            'Fantastic!',
            'Amazing!'
        ];
    }

    init(data) {
        this.currentLevelIndex = data.currentLevelIndex || 0;
        this.totalLevels = data.totalLevels || 1;
    }

    create() {
        const { width, height } = this.sys.game.canvas;

        // Semi-transparent overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.5);
        overlay.setOrigin(0, 0);

        // Create confetti effect
        this.createConfetti(width, height);

        // Main container for win UI
        const winContainer = this.add.container(width / 2, height / 2);

        // Background panel
        const panelWidth = width * 0.8;
        const panelHeight = 400;
        const panel = this.add.rectangle(0, 0, panelWidth, panelHeight, 0xFFFFFF);
        panel.setStrokeStyle(6, 0x9B7FFF);

        // Random win message
        const randomMessage = Phaser.Utils.Array.GetRandom(this.winMessages);
        
        // Win message text
        const messageText = this.add.text(0, -80, randomMessage, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '56px',
            color: '#9B7FFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Next button
        const nextButton = this.add.rectangle(0, 80, 200, 60, 0xFF6B9D);
        nextButton.setStrokeStyle(4, 0xE91E63);
        nextButton.setInteractive({ useHandCursor: true });

        const nextText = this.add.text(0, 80, 'NEXT', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Next button hover effect
        nextButton.on('pointerover', () => {
            nextButton.setFillStyle(0xE91E63);
        });
        nextButton.on('pointerout', () => {
            nextButton.setFillStyle(0xFF6B9D);
        });

        // Next button click - go to next level
        nextButton.on('pointerdown', () => {
            const nextLevel = (this.currentLevelIndex + 1) % this.totalLevels;
            this.scene.start('GameName', {
                currentLevelIndex: nextLevel
            });
        });

        // Add all elements to container
        winContainer.add([panel, messageText, nextButton, nextText]);

        // Animate the win container (scale up)
        winContainer.setScale(0);
        this.tweens.add({
            targets: winContainer,
            scale: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });

        // Bounce animation on message
        this.tweens.add({
            targets: messageText,
            y: messageText.y - 10,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createConfetti(width, height) {
        // Create colorful confetti particles
        const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf, 0xff8b94, 0xc7ceea];
        const particleCount = 100;

        for (let i = 0; i < particleCount; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(-100, -20);
            const color = Phaser.Utils.Array.GetRandom(colors);
            const size = Phaser.Math.Between(8, 16);

            const particle = this.add.rectangle(x, y, size, size, color);
            particle.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

            // Animate confetti falling
            this.tweens.add({
                targets: particle,
                y: height + 100,
                rotation: particle.rotation + Phaser.Math.FloatBetween(-Math.PI * 4, Math.PI * 4),
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Linear',
                onComplete: () => particle.destroy()
            });

            // Add side-to-side sway
            this.tweens.add({
                targets: particle,
                x: x + Phaser.Math.Between(-100, 100),
                duration: Phaser.Math.Between(1000, 2000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }
}

// Export for use in game.js
if (typeof module !== 'undefined') {
    module.exports = WinScene;
}
