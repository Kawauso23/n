(function() {
  var game;
  var ui;

  var DateOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  var main = function(dendryUI) {
    ui = dendryUI;
    game = ui.game;

    // 여기에 사용자 정의 코드 추가
  };

  var TITLE = "사회민주주의: 또 다른 역사" + '_' + "Autumn Chen";

  // 모드 로드
  // 예시:
  // https://aucchen.github.io/social_democracy_mods/v0.1.json

  window.loadMod = function(url) {
    ui.loadGame(url);
  };

  // 통계창 표시
  window.showStats = function() {

    if (
      window.dendryUI.dendryEngine.state.sceneId.startsWith('library')
    ) {

      window.dendryUI.dendryEngine.goToScene(
        'backSpecialScene'
      );

    } else {

      window.dendryUI.dendryEngine.goToScene(
        'library'
      );
    }
  };

  // 모드창 표시
  window.showMods = function() {

    window.hideOptions();

    if (
      window.dendryUI.dendryEngine.state.sceneId.startsWith(
        'mod_loader'
      )
    ) {

      window.dendryUI.dendryEngine.goToScene(
        'backSpecialScene'
      );

    } else {

      window.dendryUI.dendryEngine.goToScene(
        'mod_loader'
      );
    }
  };

  // 옵션창 열기
  window.showOptions = function() {

    var save_element = document.getElementById('options');

    window.populateOptions();

    save_element.style.display = "block";

    if (!save_element.onclick) {

      save_element.onclick = function(evt) {

        var target = evt.target;

        var save_element = document.getElementById(
          'options'
        );

        if (target == save_element) {

          window.hideOptions();
        }
      };
    }
  };

  // 옵션창 닫기
  window.hideOptions = function() {

    var save_element = document.getElementById('options');

    save_element.style.display = "none";
  };

  // 배경 비활성화
  window.disableBg = function() {

    window.dendryUI.disable_bg = true;

    document.body.style.backgroundImage = 'none';

    window.dendryUI.saveSettings();
  };

  // 배경 활성화
  window.enableBg = function() {

    window.dendryUI.disable_bg = false;

    window.dendryUI.setBg(
      window.dendryUI.dendryEngine.state.bg
    );

    window.dendryUI.saveSettings();
  };

  // 애니메이션 비활성화
  window.disableAnimate = function() {

    window.dendryUI.animate = false;

    window.dendryUI.saveSettings();
  };

  // 애니메이션 활성화
  window.enableAnimate = function() {

    window.dendryUI.animate = true;

    window.dendryUI.saveSettings();
  };

  // 배경 애니메이션 비활성화
  window.disableAnimateBg = function() {

    window.dendryUI.animate_bg = false;

    window.dendryUI.saveSettings();
  };

  // 배경 애니메이션 활성화
  window.enableAnimateBg = function() {

    window.dendryUI.animate_bg = true;

    window.dendryUI.saveSettings();
  };

  // 오디오 비활성화
  window.disableAudio = function() {

    window.dendryUI.toggle_audio(false);

    window.dendryUI.saveSettings();
  };

  // 오디오 활성화
  window.enableAudio = function() {

    window.dendryUI.toggle_audio(true);

    window.dendryUI.saveSettings();
  };

  // 이미지 표시 활성화
  window.enableImages = function() {

    window.dendryUI.show_portraits = true;

    window.dendryUI.saveSettings();
  };

  // 이미지 표시 비활성화
  window.disableImages = function() {

    window.dendryUI.show_portraits = false;

    window.dendryUI.saveSettings();
  };

  // 라이트 모드
  window.enableLightMode = function() {

    window.dendryUI.dark_mode = false;

    document.body.classList.remove('dark-mode');

    window.dendryUI.saveSettings();
  };

  // 다크 모드
  window.enableDarkMode = function() {

    window.dendryUI.dark_mode = true;

    document.body.classList.add('dark-mode');

    window.dendryUI.saveSettings();
  };

  // 옵션 체크박스 상태 갱신
  window.populateOptions = function() {

    var disable_bg = window.dendryUI.disable_bg;

    var animate = window.dendryUI.animate;

    var disable_audio = window.dendryUI.disable_audio;

    var show_portraits = window.dendryUI.show_portraits;

    if (disable_bg) {

      $('#backgrounds_no')[0].checked = true;

    } else {

      $('#backgrounds_yes')[0].checked = true;
    }

    if (animate) {

      $('#animate_yes')[0].checked = true;

    } else {

      $('#animate_no')[0].checked = true;
    }

    if (disable_audio) {

      $('#audio_no')[0].checked = true;

    } else {

      $('#audio_yes')[0].checked = true;
    }

    if (show_portraits) {

      $('#images_yes')[0].checked = true;

    } else {

      $('#images_no')[0].checked = true;
    }

    if (window.dendryUI.dark_mode) {

      $('#dark_mode')[0].checked = true;

    } else {

      $('#light_mode')[0].checked = true;
    }
  };

  // 텍스트 출력 전 수정 가능
  window.displayText = function(text) {

    return text;
  };

  // signal 이벤트 처리
  window.handleSignal = function(signal, event, scene_id) {

  };

  // 새 페이지 진입 시 실행
  window.onNewPage = function() {

    var scene =
      window.dendryUI.dendryEngine.state.sceneId;

    if (scene != 'root' && !window.justLoaded) {

      window.dendryUI.autosave();
    }

    if (window.justLoaded) {

      window.justLoaded = false;
    }
  };

  // 사이드바 갱신
  window.updateSidebar = function() {

    $('#qualities').empty();

    var scene =
      dendryUI.game.scenes[window.statusTab];

    dendryUI.dendryEngine._runActions(
      scene.onArrival
    );

    var displayContent =
      dendryUI.dendryEngine._makeDisplayContent(
        scene.content,
        true
      );

    $('#qualities').append(
      dendryUI.contentToHTML.convert(displayContent)
    );
  };

  // 탭 변경
  window.changeTab = function(newTab, tabId) {

    if (
      tabId == 'poll_tab' &&
      dendryUI.dendryEngine.state.qualities.historical_mode
    ) {

      window.alert(
        '역사 모드에서는 여론조사를 사용할 수 없습니다.'
      );

      return;
    }

    var tabButton = document.getElementById(tabId);

    var tabButtons =
      document.getElementsByClassName('tab_button');

    for (i = 0; i < tabButtons.length; i++) {

      tabButtons[i].className =
        tabButtons[i].className.replace(
          ' active',
          ''
        );
    }

    tabButton.className += ' active';

    window.statusTab = newTab;

    window.updateSidebar();
  };

  // 콘텐츠 표시 시 사이드바 갱신
  window.onDisplayContent = function() {

    window.updateSidebar();
  };

  /*
   * 상태 바 생성
   *
   * quality = 현재 값
   * qualityName = 이름
   * max/min = 범위
   * colors = 색상 사용 여부
   */

  window.generateBar = function(
    quality,
    qualityName,
    max,
    min,
    colors
  ) {

    var bar = document.createElement('div');

    bar.className = 'bar';

    var value = document.createElement('div');

    value.className = 'barValue';

    var width =
      (quality - min) / (max - min);

    if (width > 1) {

      width = 1;

    } else if (width < 0) {

      width = 0;
    }

    value.style.width =
      Math.round(width * 100) + '%';

    if (colors) {

      value.style.backgroundColor =
        window.probToColor(width * 100);
    }

    bar.textContent =
      qualityName + ': ' + quality;

    if (colors) {

      bar.textContent += '/' + max;
    }

    bar.appendChild(value);

    return bar;
  };

  window.justLoaded = true;

  window.statusTab = "status";

  window.dendryModifyUI = main;

  console.log(
    "통계 수정 가능: dendryUI.dendryEngine.state.qualities 확인"
  );

  window.onload = function() {

    window.dendryUI.loadSettings({
      show_portraits: false
    });

    if (window.dendryUI.dark_mode) {

      document.body.classList.add('dark-mode');
    }

    window.pinnedCardsDescription =
      "보좌진 카드 - 행동은 6개월마다 1회 사용 가능";
  };

}());
