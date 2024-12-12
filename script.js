document.addEventListener('DOMContentLoaded', () => {
  const csvFilesInput = document.getElementById('csv-files');
  const csvSelect = document.getElementById('csv-select');
  const tableSection = document.getElementById('table-section');
  const participantsTableBody = document.querySelector('#participants-table tbody');
  const saveAttendanceBtn = document.getElementById('save-attendance');
  const orderSection = document.getElementById('order-section');
  const decideOrderBtn = document.getElementById('decide-order');
  const orderTableWrapper = document.querySelector('#order-section .table-wrapper');
  const orderTable = document.getElementById('order-table');
  const orderTableBody = document.querySelector('#order-table tbody');
  const groupSection = document.getElementById('group-section');
  const createGroupsBtn = document.getElementById('create-groups');
  const groupCountInput = document.getElementById('group-count');
  const groupsDisplay = document.getElementById('groups-display');
  const groupsTableWrapper = document.getElementById('groups-display');

  let allCSVData = {};
  let currentData = [];

  // ファイル選択時
  csvFilesInput.addEventListener('change', (e) => {
      const files = e.target.files;
      csvSelect.innerHTML = '<option value="">-- CSVファイルを選択 --</option>';
      allCSVData = {};
      currentData = [];
      tableSection.classList.add('hidden');
      orderSection.classList.add('hidden');
      groupSection.classList.add('hidden');
      groupsDisplay.innerHTML = '';
      orderTableWrapper.classList.add('hidden');
      orderTableBody.innerHTML = '';
      participantsTableBody.innerHTML = '';

      Array.from(files).forEach(file => {
          const option = document.createElement('option');
          option.value = file.name;
          option.textContent = file.name;
          csvSelect.appendChild(option);

          const reader = new FileReader();
          reader.onload = (event) => {
              const text = event.target.result;
              const data = parseCSV(text);
              allCSVData[file.name] = data;
          };
          reader.readAsText(file);
      });
  });

  // CSVファイル選択時
  csvSelect.addEventListener('change', (e) => {
      const selectedFile = e.target.value;
      if (selectedFile && allCSVData[selectedFile]) {
          currentData = [...allCSVData[selectedFile]]; // コピー
          displayParticipants(currentData);
          tableSection.classList.remove('hidden');
          orderSection.classList.remove('hidden');
          groupSection.classList.remove('hidden');
          orderTableWrapper.classList.add('hidden');
          orderTableBody.innerHTML = '';
          groupsDisplay.innerHTML = '';
          groupsTableWrapper.classList.add('hidden');
      } else {
          tableSection.classList.add('hidden');
          orderSection.classList.add('hidden');
          groupSection.classList.add('hidden');
          groupsDisplay.innerHTML = '';
          orderTableWrapper.classList.add('hidden');
          orderTableBody.innerHTML = '';
          participantsTableBody.innerHTML = '';
      }
  });

  // 欠席者保存
  saveAttendanceBtn.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.absent-checkbox');
      currentData = currentData.filter((person, index) => {
          const checkbox = checkboxes[index];
          return checkbox && !checkbox.checked;
      });
      displayParticipants(currentData);
  });

  // 順番決めボタン
  decideOrderBtn.addEventListener('click', () => {
      if (currentData.length === 0) {
          alert('参加者がいません。');
          return;
      }
      const shuffled = shuffleArray([...currentData]);
      orderTableBody.innerHTML = '';
      shuffled.forEach((person, index) => {
          const tr = document.createElement('tr');
          const tdOrder = document.createElement('td');
          tdOrder.textContent = index + 1;
          const tdName = document.createElement('td');
          tdName.textContent = person.名前;
          tr.appendChild(tdOrder);
          tr.appendChild(tdName);
          orderTableBody.appendChild(tr);
      });
      orderTableWrapper.classList.remove('hidden');
  });

  // グループ作成ボタン
  createGroupsBtn.addEventListener('click', () => {
      const groupCount = parseInt(groupCountInput.value);
      if (isNaN(groupCount) || groupCount < 1) {
          alert('有効なグループ数を入力してください。');
          return;
      }
      if (currentData.length === 0) {
          alert('参加者がいません。');
          return;
      }
      if (groupCount > currentData.length) {
          alert('グループ数が出席者数を超えています。グループ数を減らしてください。');
          return;
      }
      const { groups, isBalanced } = createBalancedRandomGroups(currentData, groupCount);
      if (!groups) {
          return;
      }
      displayGroups(groups);
  });

  // CSVパース関数
  function parseCSV(text) {
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];
      for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          const obj = {};
          headers.forEach((header, index) => {
              obj[header] = cols[index];
          });
          data.push(obj);
      }
      return data;
  }

  // 参加者テーブル表示関数
  function displayParticipants(data) {
      participantsTableBody.innerHTML = '';
      data.forEach(person => {
          const tr = document.createElement('tr');
          const tdName = document.createElement('td');
          tdName.textContent = person.名前;
          const tdGender = document.createElement('td');
          tdGender.textContent = person.性別;
          const tdAbsent = document.createElement('td');
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.classList.add('absent-checkbox');
          tdAbsent.appendChild(checkbox);
          tr.appendChild(tdName);
          tr.appendChild(tdGender);
          tr.appendChild(tdAbsent);
          participantsTableBody.appendChild(tr);
      });
  }

  // 配列シャッフル関数
  function shuffleArray(array) {
      for (let i = array.length -1; i >0; i--){
          const j = Math.floor(Math.random() * (i +1));
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }

  // グループ作成関数（ランダムかつ性別バランスを考慮）
  function createBalancedRandomGroups(data, groupCount) {
      // シャッフル
      const shuffled = shuffleArray([...data]);

      // 性別ごとに分ける
      const males = shuffled.filter(person => person.性別 === '男');
      const females = shuffled.filter(person => person.性別 === '女');

      // 目標グループサイズ
      const baseSize = Math.floor(shuffled.length / groupCount);
      const extra = shuffled.length % groupCount;

      // 初期グループ配列
      const groups = Array.from({ length: groupCount }, () => []);

      // グループごとの目標サイズ
      const groupSizes = groups.map((_, index) => baseSize + (index < extra ? 1 : 0));

      // 性別バランスを保つための目標女性数
      const maxFemalesPerGroup = groupSizes.map(size => Math.floor(size / 2));

      // 女性を均等に分配
      const { femalesPerGroup, isBalanced } = distributeFemales(females, groupCount, maxFemalesPerGroup);

      // グループに女性を割り当て
      femalesPerGroup.forEach((femaleList, groupIndex) => {
          groups[groupIndex].push(...femaleList);
      });

      // 残りの男性を均等に割り当て
      const remainingMales = males.slice();
      remainingMales.forEach((male, index) => {
          const groupIndex = index % groupCount;
          if (groups[groupIndex].length < groupSizes[groupIndex]) {
              groups[groupIndex].push(male);
          } else {
              // グループが既に満員の場合、次のグループを探す
              for (let i = 0; i < groupCount; i++) {
                  const newGroupIndex = (groupIndex + i) % groupCount;
                  if (groups[newGroupIndex].length < groupSizes[newGroupIndex]) {
                      groups[newGroupIndex].push(male);
                      break;
                  }
              }
          }
      });

      return { groups, isBalanced };
  }

  // 女性をグループに均等に分配する関数
  function distributeFemales(females, groupCount, maxFemalesPerGroup) {
      const femalesPerGroup = Array.from({ length: groupCount }, () => []);
      let femaleIndex = 0;
      let isBalanced = true;

      // 最大許容数まで女性を各グループに分配
      for (let i = 0; i < groupCount; i++) {
          const target = maxFemalesPerGroup[i];
          for (let j = 0; j < target && femaleIndex < females.length; j++) {
              femalesPerGroup[i].push(females[femaleIndex++]);
          }
      }

      // 残った女性を他のグループに追加
      while (femaleIndex < females.length) {
          let added = false;
          for (let i = 0; i < groupCount; i++) {
              if (femalesPerGroup[i].length < maxFemalesPerGroup[i] + 4) { // 1人超過を許容
                  femalesPerGroup[i].push(females[femaleIndex++]);
                  added = true;
                  break;
              }
          }
          if (!added) {
              // さらに追加できない場合、バランスが崩れている
              isBalanced = false;
              break;
          }
      }

      // バランスが崩れているかどうかを確認
      for (let i = 0; i < groupCount; i++) {
          if (femalesPerGroup[i].length > maxFemalesPerGroup[i]) {
              isBalanced = false;
              break;
          }
      }

      return { femalesPerGroup, isBalanced };
  }

  // グループ表示関数（テーブル形式）
  function displayGroups(groups) {
      groupsDisplay.innerHTML = '';

      groups.forEach((group, index) => {
          const groupTable = document.createElement('table');
          groupTable.classList.add('group-table');

          const thead = document.createElement('thead');
          const headerRow = document.createElement('tr');
          const thGroup = document.createElement('th');
          thGroup.textContent = `グループ ${index + 1} (${group.length}人)`;
          thGroup.colSpan = 2;
          headerRow.appendChild(thGroup);
          thead.appendChild(headerRow);
          groupTable.appendChild(thead);

          const tbody = document.createElement('tbody');
          group.forEach(person => {
              const tr = document.createElement('tr');
              const tdName = document.createElement('td');
              tdName.textContent = person.名前;
              const tdGender = document.createElement('td');
              tdGender.textContent = person.性別;
              tr.appendChild(tdName);
              tr.appendChild(tdGender);
              tbody.appendChild(tr);
          });
          groupTable.appendChild(tbody);

          groupsDisplay.appendChild(groupTable);
      });

      groupsTableWrapper.classList.remove('hidden');
  }
});
