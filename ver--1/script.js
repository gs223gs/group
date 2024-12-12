// 参加者データを格納する配列
let participants = [];

// 編集中の参加者のインデックス
let editingIndex = null;

// 参加者を追加または編集する関数
function addOrEditParticipant() {
    const nameInput = document.getElementById('name-input');
    const genderInput = document.getElementById('gender-input');

    const name = nameInput.value.trim();
    const gender = genderInput.value;

    if (name === '') {
        alert('名前を入力してください。');
        return;
    }

    if (editingIndex !== null) {
        // 編集モード
        participants[editingIndex] = { name, gender };
        editingIndex = null;
        document.getElementById('add-button').textContent = '追加';
    } else {
        // 新規追加
        participants.push({ name, gender });
    }

    nameInput.value = '';
    updateParticipantTable();
}

// 参加者リストを更新する関数
function updateParticipantTable() {
    const tbody = document.querySelector('#participant-table tbody');
    tbody.innerHTML = '';

    participants.forEach((participant, index) => {
        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        const genderTd = document.createElement('td');
        const actionTd = document.createElement('td');

        nameTd.textContent = participant.name;
        genderTd.textContent = participant.gender === 'male' ? '男の子' : '女の子';

        // 編集ボタン
        const editButton = document.createElement('button');
        editButton.textContent = '編集';
        editButton.classList.add('edit-button');
        editButton.addEventListener('click', () => editParticipant(index));

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => deleteParticipant(index));

        actionTd.appendChild(editButton);
        actionTd.appendChild(deleteButton);

        tr.appendChild(nameTd);
        tr.appendChild(genderTd);
        tr.appendChild(actionTd);
        tbody.appendChild(tr);
    });
}

// 参加者を編集する関数
function editParticipant(index) {
    const participant = participants[index];
    document.getElementById('name-input').value = participant.name;
    document.getElementById('gender-input').value = participant.gender;
    editingIndex = index;
    document.getElementById('add-button').textContent = '更新';
}

// 参加者を削除する関数
function deleteParticipant(index) {
    participants.splice(index, 1);
    updateParticipantTable();
}

// 順番を決める関数
function decideOrder() {
    const shuffled = [...participants];
    shuffleArray(shuffled);

    const orderTable = document.getElementById('order-table');
    orderTable.innerHTML = '';

    shuffled.forEach((participant, index) => {
        const tr = document.createElement('tr');
        const orderTd = document.createElement('td');
        const nameTd = document.createElement('td');
        const genderTd = document.createElement('td');

        orderTd.textContent = index + 1;
        nameTd.textContent = participant.name;
        genderTd.textContent = participant.gender === 'male' ? '男の子' : '女の子';

        tr.appendChild(orderTd);
        tr.appendChild(nameTd);
        tr.appendChild(genderTd);
        orderTable.appendChild(tr);
    });
}

// 配列をシャッフルする関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// グループ分けをする関数
function divideGroups() {
    const groupNumberInput = document.getElementById('group-number');
    const groupNumber = parseInt(groupNumberInput.value);

    if (groupNumber < 1) {
        alert('グループの数は1以上にしてください。');
        return;
    }

    const groupResultDiv = document.getElementById('group-result');
    groupResultDiv.innerHTML = '';

    // 男性と女性を分ける
    const males = participants.filter(p => p.gender === 'male');
    const females = participants.filter(p => p.gender === 'female');

    // シャッフル
    shuffleArray(males);
    shuffleArray(females);

    // グループ配列を作成
    const groups = Array.from({ length: groupNumber }, () => []);

    // 参加者をグループに割り当てる
    let index = 0;
    while (males.length > 0 || females.length > 0) {
        const currentGroup = groups[index % groupNumber];
        const maleCount = currentGroup.filter(p => p.gender === 'male').length;
        const femaleCount = currentGroup.filter(p => p.gender === 'female').length;

        // 女の子が半数以上にならないようにする
        if (femaleCount < Math.floor((currentGroup.length + 1) / 2) && females.length > 0) {
            currentGroup.push(females.pop());
        } else if (males.length > 0) {
            currentGroup.push(males.pop());
        } else if (females.length > 0) {
            currentGroup.push(females.pop());
        }
        index++;
    }

    // グループを表示
    groups.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');

        const groupTitle = document.createElement('h3');
        groupTitle.textContent = `グループ ${index + 1}`;
        groupDiv.appendChild(groupTitle);

        const table = document.createElement('table');

        group.forEach(participant => {
            const tr = document.createElement('tr');
            const nameTd = document.createElement('td');
            const genderTd = document.createElement('td');

            nameTd.textContent = participant.name;
            genderTd.textContent = participant.gender === 'male' ? '男の子' : '女の子';

            tr.appendChild(nameTd);
            tr.appendChild(genderTd);
            table.appendChild(tr);
        });

        groupDiv.appendChild(table);
        groupResultDiv.appendChild(groupDiv);
    });
}

// エンターキーで参加者を追加する機能
document.getElementById('name-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addOrEditParticipant();
    }
});

// イベントリスナーの設定
document.getElementById('add-button').addEventListener('click', addOrEditParticipant);
document.getElementById('decide-order-button').addEventListener('click', decideOrder);
document.getElementById('divide-group-button').addEventListener('click', divideGroups);
