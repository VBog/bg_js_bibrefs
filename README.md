### Bg JS Bible References highlighting  ###

Contributors: VBog

Tags: Библия, Ветхий завет, Евангелие, Апостол, ссылки, link, reference

License: GPLv2

License URI: http://www.gnu.org/licenses/gpl-2.0.html

JS-cкрипт подсветки ссылок на Библию


## Description ##

Скрипт подсвечивает в тексте страницы ссылки на Библию, добавляет к ним гиперссылки на отрывки из Библии на сайте [https://azbyka.ru/biblia/](https://azbyka.ru/biblia/).

При наведении курсора мыши на ссылку появляется всплывающее окно с текстом отрывка из Библии.

Каждый стих Библии во всплывающем окне снабжен ссылкой на его Толковния святыми отцами на сайте [https://azbyka.ru/biblia/in/](https://azbyka.ru/biblia/in/) и ссылками на паралельные места в Священном Писании.

Используется API сайта Библия на портале "Азбука веры".

Требуется библиотека jQuery.

*Параметры:*

	var bg_bibrefs_options = {
		replace: false,			// Заменять или нет существующую ссылку, на ссылку на АВ 
		nodot: false,			// true - разрешить отсутствие точки в сокращении книги; false - запретить
		collision: false,		// true - восточная нотация; false - западная нотация
		
		langs: '&r~с',			// Языки Библии
		popup: true,			// Всплывающее окно с текстом Библии: true - отображать, false - не отображать
		interpretation:true,	// Ссылки на Толкования true - отображать; false - не отображать
		crossRefs: true,		// Перекрестные ссылки: true - отображать; false - не отображать
		newStyle: '',			// Стиль для найденных ссылок на Библию
		log: false				// Журнал Sanitizer
	};
		
*Доступны глобальные переменные:*

	var bg_bibrefs_progress = 0;// Счетчик просмотра допустимых обозначений книг Библии
	var bg_bibrefs_count = 0;	// Количество найденных ссылок на Библию



## Changelog ##

= 2.0 =
* Initial release