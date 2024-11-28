document.addEventListener('DOMContentLoaded', () => {
  const csvFilesInput = document.getElementById('csvFilesInput');
  const fileList = document.getElementById('fileList');
  const csvSelect = document.getElementById('csvSelect');
  const loadCsvBtn = document.getElementById('loadCsvBtn');
  const peopleTableBody = document.querySelector('#peopleTable tbody');
  const decideOrderBtn = document.getElementById('decideOrderBtn');
  const orderTableBody = document.querySelector('#orderTable tbody');
  const assignGroupsBtn = document.getElementById('assignGroupsBtn');
  const groupSizeInput = document.getElementById('groupSize');
  const groupsContainer = document.getElementById('groupsContainer');

  let csvData = {}; // { filename: [ {name, gender, attendance}, ... ] }

  // ファイル選択時の処理
  csvFilesInput.addEventListener('change', (e) => {
      const files = e.target.files;
      fileList.innerHTML = '';
      csvSelect.innerHTML = '<option value="">CSVファイルを選択してください</option>';
      csvData = {};

      Array.from(files).forEach(file => {
          if (file.name.endsWith('.csv')) {
              const li = document.createElement('li');
              li.textContent = file.name;
              fileList.appendChild(li);

              csvSelect.innerHTML += `<option value="${file.name}">${file.name}</option>`;
          }
      });
  });

  // CSV読み込みボタンの処理
  loadCsvBtn.addEventListener('click', () => {
      const selectedFile = csvSelect.value;
      if (!selectedFile) {
          alert('CSVファイルを選択してください。');
          return;
      }

      const file = Array.from(csvFilesInput.files).find(f => f.name === selectedFile);
      if (!file) {
          alert('選択されたファイルが見つかりません。');
          return;
      }

      const reader = new FileReader();
      reader.onload = function(event) {
          const text = event.target.result;
          const data = parseCSV(text);
          csvData[selectedFile] = data;
          displayPeopleTable(data);
      };
      reader.readAsText(file);
  });

  // CSVパース関数
  function parseCSV(text) {
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const entry = {};
          headers.forEach((header, index) => {
              entry[header] = values[index];
          });
          return entry;
      });
      return data;
  }

  // 人員テーブル表示
  function displayPeopleTable(data) {
      peopleTableBody.innerHTML = '';
      data.forEach((person, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td>${person['名前']}</td>
              <td>${person['性別']}</td>
              <td>${person['出席']}</td>
              <td><button data-index="${index}">削除</button></td>
          `;
          peopleTableBody.appendChild(tr);
      });
  }

  // 欠席の人を削除
  peopleTableBody.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
          const index = e.target.getAttribute('data-index');
          const selectedFile = csvSelect.value;
          if (csvData[selectedFile]) {
              csvData[selectedFile].splice(index, 1);
              displayPeopleTable(csvData[selectedFile]);
          }
      }
  });

  // 順番決め機能
  decideOrderBtn.addEventListener('click', () => {
      const selectedFile = csvSelect.value;
      if (!selectedFile || !csvData[selectedFile]) {
          alert('有効なCSVファイルを読み込んでください。');
          return;
      }

      const shuffled = shuffleArray([...csvData[selectedFile]]);
      orderTableBody.innerHTML = '';
      shuffled.forEach((person, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td>${index + 1}</td>
              <td>${person['名前']}</td>
          `;
          orderTableBody.appendChild(tr);
      });
  });

  // 配列をシャッフルする関数
  function shuffleArray(array) {
      for (let i = array.length -1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i +1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }

  // グループ分け機能
  assignGroupsBtn.addEventListener('click', () => {
      const selectedFile = csvSelect.value;
      const groupSize = parseInt(groupSizeInput.value);
      if (!selectedFile || !csvData[selectedFile]) {
          alert('有効なCSVファイルを読み込んでください。');
          return;
      }
      if (isNaN(groupSize) || groupSize < 1) {
          alert('グループの人数を正しく設定してください。');
          return;
      }

      const attendees = csvData[selectedFile].filter(person => person['出席'] === '出席');
      const shuffled = shuffleArray(attendees);
      const groups = [];
      let currentGroup = [];

      let femaleCount = 0;

      shuffled.forEach(person => {
          if (person['性別'] === '女') {
              // 各グループで女性が半数以上にならないように調整
              const suitableGroup = groups.find(group => {
                  const females = group.filter(p => p['性別'] === '女').length;
                  return females < Math.floor(groupSize / 2) + (groupSize % 2);
              });
              if (suitableGroup) {
                  suitableGroup.push(person);
              } else {
                  // 新しいグループを作成
                  groups.push([person]);
              }
          } else {
              // 男性はどのグループにも追加可能
              let added = false;
              for (let group of groups) {
                  if (group.length < groupSize) {
                      group.push(person);
                      added = true;
                      break;
                  }
              }
              if (!added) {
                  groups.push([person]);
              }
          }
      });

      // 余りの処理
      const total = groups.reduce((acc, group) => acc + group.length, 0);
      const remainder = attendees.length - total;
      if (remainder > 0) {
          for (let i = 0; i < remainder; i++) {
              groups[i % groups.length].push(shuffled[total + i]);
          }
      }

      displayGroups(groups);
  });

  // グループ表示
  function displayGroups(groups) {
      groupsContainer.innerHTML = '';
      groups.forEach((group, index) => {
          const div = document.createElement('div');
          div.classList.add('group');
          const groupTitle = document.createElement('h3');
          groupTitle.textContent = `グループ ${index + 1}`;
          const ul = document.createElement('ul');
          group.forEach(person => {
              const li = document.createElement('li');
              li.textContent = `${person['名前']} (${person['性別']})`;
              ul.appendChild(li);
          });
          div.appendChild(groupTitle);
          div.appendChild(ul);
          groupsContainer.appendChild(div);
      });
  }
});
