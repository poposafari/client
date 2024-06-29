export function messageBox(scene:Phaser.Scene,msg:string){
    const centerX = scene.cameras.main.centerX;
    const centerY = scene.cameras.main.centerY+310;

    const messageBox = scene.add.image(centerX, centerY, 'messageBox');
    messageBox.setOrigin(0.5);
    messageBox.scale=12;
    const style = {
        font: '30px Myfont',
        fill: '#000000',
        wordWrap: { width: messageBox.width*12-50, useAdvancedWrap: true }
    };

    const startX = centerX - (messageBox.displayWidth / 2) + 10; // 메시지 박스의 왼쪽 상단에서 시작
    const startY = centerY - (messageBox.displayHeight / 2) + 10;
    const textArray = msg.split('');
    let displayText = '';

    const messageText = scene.add.text(startX, startY, displayText, style).setOrigin(0, 0);

    textArray.forEach((char, index) => {
        scene.time.delayedCall(index * 10, () => {
            displayText += char;
            messageText.setText(displayText);
        }, [], scene);
    });
}