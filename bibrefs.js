// Скрипт подсветки ссылок на Библию
// Автор: Вадим Богайсков
// Версия 2.2 от 15.06.2021
// Требуются:
//  - Папка bible с json-файлами Библии на разных языках
//  - Папка img с иконкой expand.png
//  - Папка css с файлом стилей styles.css


/*******************************************************************************

   ПАРАМЕТРЫ СКРИПТА

*******************************************************************************/ 
// Параметры по умолчанию
var bg_bibrefs_options_default = {
	replace: false,			// Заменять или нет существующую ссылку, на ссылку на АВ 
	nodot: false,			// true - разрешить отсутствие точки в сокращении книги; false - запретить
	collision: false,		// true - восточная нотация; false - западная нотация
	
	langs: ['r','c'],		// Языки на сайте Библии
	get_lang: false,		// Получить языки из URL, если они там заданы
	popup: true,			// Всплывающее окно с текстом Библии: true - отображать, false - не отображать
	popup_lang: 'r',		// Язык во всплывающем окне
	interpretation: true,	// Ссылки на Толкования: true - отображать; false - не отображать
	crossRefs: true,		// Перекрестные ссылки: true - отображать; false - не отображать
	newStyle: '',			// Стиль для найденных ссылок на Библию
	log: false				// Журнал Sanitizer
};
// Устанавливаем значения параметров по умолчанию, если они не заданы
if (typeof bg_bibrefs_options == 'undefined') var bg_bibrefs_options = new Object();
for (const [key, value] of Object.entries(bg_bibrefs_options_default)) {
	if (!(key in bg_bibrefs_options)) bg_bibrefs_options[key] = value;
}
// Получить список языков из URL страницы, если они там заданы и включена соответствующая опция 
let url_srch_pts = location.search.split('&');
if (bg_bibrefs_options.get_lang && url_srch_pts.length > 1) {
	bg_bibrefs_options.langs = url_srch_pts[1].split('~');
}
/*******************************************************************************/

/*******************************************************************************

   Глобальные переменные

*******************************************************************************/  
var bg_bibrefs_url = [		// Допустимые обозначения книг Священного Писания
		// Ветхий Завет
		// Пятикнижие Моисея															
	{name:'Gen\\.', sign:'Gen'},		//'Книга Бытия' 	
	{name:'Бытие\\.?', sign:'Gen'},					
	{name:'Быт\\.', sign:'Gen'},					
	{name:'1\\s*Мој\\.', sign:'Gen'},					
	{name:'1\\s*Мојс\\.', sign:'Gen'},					
	{name:'Ex\\.', sign:'Ex'},	 		//'Книга Исход' 			
	{name:'Исх\\.', sign:'Ex'},	 					
	{name:'2\\s*Мој\\.', sign:'Ex'},					
	{name:'2\\s*Мојс\\.', sign:'Ex'},					
	{name:'Lev\\.', sign:'Lev'}, 		//'Книга Левит' 		
	{name:'Левит\\.?', sign:'Lev'}, 							
	{name:'Лев\\.', sign:'Lev'}, 							
	{name:'Лв\\.', sign:'Lev'}, 							
	{name:'3\\s*Мој\\.', sign:'Lev'},					
	{name:'3\\s*Мојс\\.', sign:'Lev'},					
	{name:'Num\\.', sign:'Num'}, 		//'Книга Числа'	
	{name:'Числа\\.?', sign:'Num'}, 						
	{name:'Числ\\.', sign:'Num'}, 						
	{name:'Чис\\.', sign:'Num'}, 						
	{name:'Чс\\.', sign:'Num'}, 						
	{name:'4\\s*Мој\\.', sign:'Num'},					
	{name:'4\\s*Мојс\\.', sign:'Num'},					
	{name:'Deut\\.', sign:'Deut'},		//'Второзаконие'		
	{name:'Втор\\.', sign:'Deut'},							
	{name:'5\\s*Мој\\.', sign:'Deut'},					
	{name:'5\\s*Мојс\\.', sign:'Deut'},					
		// «Пророки» (Невиим) 
	{name:'Nav\\.', sign:'Nav'}, 		//'Книга Иисуса Навина'	
	{name:'Нав\\.', sign:'Nav'}, 						
	{name:'ИсНав\\.', sign:'Nav'}, 						
	{name:'ИсН\\.', sign:'Nav'}, 						
	{name:'Judg\\.', sign:'Judg'}, 	//'Книга Судей Израилевых' 	
	{name:'Судей\\.?', sign:'Judg'}, 						
	{name:'Суд\\.', sign:'Judg'}, 						
	{name:'Сд\\.', sign:'Judg'}, 						
	{name:'Rth\\.', sign:'Rth'},		//'Книга Руфь'	
	{name:'Руфь\\.?', sign:'Rth'},						
	{name:'Рута\\.?', sign:'Rth'},						
	{name:'Руф\\.', sign:'Rth'},						
	{name:'1\\s*Sam\\.', sign:'1Sam'},		//'Первая книга Царств (Первая книга Самуила)' 	
	{name:'1\\s*Цар\\.', sign:'1Sam'},						
	{name:'1\\s*Сам\\.', sign:'1Sam'},						
	{name:'1\\s*См\\.', sign:'1Sam'},						
	{name:'2\\s*Sam\\.', sign:'2Sam'},		//'Вторая книга Царств (Вторая книга Самуила)' 	
	{name:'2\\s*Цар\\.', sign:'2Sam'},						
	{name:'2\\s*Сам\\.', sign:'2Sam'},						
	{name:'2\\s*См\\.', sign:'2Sam'},						
	{name:'1\\s*King\\.?', sign:'1King'}, 	//'Третья книга Царств (Первая книга Царей)' 
	{name:'3\\s*Цар\\.', sign:'1King'}, 					
	{name:'1\\s*Царев\\.?', sign:'1King'}, 					
	{name:'1\\s*Царей\\.?', sign:'1King'}, 					
	{name:'2\\s*King\\.?', sign:'2King'}, 	//'Четвертая книга Царств (Вторая книга Царей)' 
	{name:'4\\s*Цар\\.', sign:'2King'}, 					
	{name:'2\\s*Царев\\.?', sign:'2King'}, 					
	{name:'2\\s*Царей\\.?', sign:'2King'}, 					
	{name:'1\\s*Chron\\.', sign:'1Chron'},	//'Первая книга Паралипоменон (Первая книга Хроник, Первая Летопись)' 
	{name:'1\\s*Пар\\.', sign:'1Chron'},		
	{name:'1\\s*Хрон\\.', sign:'1Chron'},		
	{name:'1\\s*Хр\\.', sign:'1Chron'},		
	{name:'1\\s*Лет\\.', sign:'1Chron'},		
	{name:'1\\s*Дн\\.', sign:'1Chron'},		
	{name:'2\\s*Chron\\.', sign:'2Chron'},	//'Вторая книга Паралипоменон (Вторая книга Хроник, Вторая Летопись)' 
	{name:'2\\s*Пар\\.', sign:'2Chron'},		
	{name:'2\\s*Хрон\\.', sign:'2Chron'},		
	{name:'2\\s*Хр\\.', sign:'2Chron'},		
	{name:'2\\s*Лет\\.', sign:'2Chron'},		
	{name:'2\\s*Дн\\.', sign:'2Chron'},		
	{name:'Ezr\\.', sign:'Ezr'}, 		//'Книга Ездры (Первая книга Ездры)' 
	{name:'1\\s*Ездр\\.', sign:'Ezr'}, 				
	{name:'1\\s*Езд\\.', sign:'Ezr'}, 				
	{name:'Ездр\\.', sign:'Ezr'}, 				
	{name:'Езд\\.', sign:'Ezr'}, 				
	{name:'Ез\\.', sign:'Ezr'}, 				
	{name:'Језд\\.', sign:'Ezr'}, 				
	{name:'Nehem\\.', sign:'Nehem'}, 	//'Книга Неемии'	
	{name:'Неем\\.', sign:'Nehem'}, 						
	{name:'Нем\\.', sign:'Nehem'}, 						
	{name:'Нм\\.', sign:'Nehem'}, 						
	{name:'Est\\.', sign:'Est'}, 		//'Книга Есфири'  
	{name:'Есф\\.', sign:'Est'}, 							
	{name:'Эсф\\.', sign:'Est'}, 							
	{name:'Јест\\.', sign:'Est'}, 							
		// «Писания» (Ктувим)		
	{name:'Job\\.?', sign:'Job'}, 		//'Книга Иова'			
	{name:'Иов\\.?', sign:'Job'}, 								
	{name:'Јов\\.?', sign:'Job'}, 								
	{name:'Ps\\.', sign:'Ps'},			//'Псалтирь' 	
	{name:'Псалт\\.', sign:'Ps'},							
	{name:'Псал\\.', sign:'Ps'},							
	{name:'Пс\\.', sign:'Ps'},							
	{name:'Prov\\.', sign:'Prov'}, 	//'Книга Притчей Соломоновых' 
	{name:'Притчи\\.?', sign:'Prov'}, 					
	{name:'Притч\\.', sign:'Prov'}, 					
	{name:'Прит\\.', sign:'Prov'}, 					
	{name:'Приче\\.', sign:'Prov'}, 					
	{name:'Прич\\.', sign:'Prov'}, 					
	{name:'Eccl\\.', sign:'Eccl'}, 	//'Книга Екклезиаста, или Проповедника' 		
	{name:'Еккл\\.', sign:'Eccl'}, 							
	{name:'Екк\\.', sign:'Eccl'}, 							
	{name:'Екл\\.', sign:'Eccl'}, 							
	{name:'Ек\\.', sign:'Eccl'}, 							
	{name:'Проп\\.', sign:'Eccl'}, 							
	{name:'Song\\.?', sign:'Song'},		//'Песнь песней Соломона'		
	{name:'Песня\\.?', sign:'Song'},							
	{name:'Песн\\.', sign:'Song'},							
	{name:'Пес\\.', sign:'Song'},							
	{name:'Is\\.', sign:'Is'}, 		//'Книга пророка Исайи'		
	{name:'Исайи\\.?', sign:'Is'}, 							
	{name:'Исаи\\.?', sign:'Is'}, 							
	{name:'Ис\\.', sign:'Is'}, 							
	{name:'Jer\\.', sign:'Jer'},		//'Книга пророка Иеремии'			
	{name:'Иер\\.', sign:'Jer'},								
	{name:'Јер\\.', sign:'Jer'},								
	{name:'Lam\\.', sign:'Lam'}, 		//'Книга Плач Иеремии' 	
	{name:'Плч\\.', sign:'Lam'}, 						
	{name:'Плач\\.', sign:'Lam'}, 						
	{name:'Ezek\\.', sign:'Ezek'},		//'Книга пророка Иезекииля'		
	{name:'Иез\\.', sign:'Ezek'},							
	{name:'Језек\\.', sign:'Ezek'},							
	{name:'Јез\\.', sign:'Ezek'},							
	{name:'Dan\\.', sign:'Dan'}, 		//'Книга пророка Даниила'			
	{name:'Дан\\.', sign:'Dan'}, 								
	{name:'Днл\\.', sign:'Dan'}, 
	{name:'Данило\\.?', sign:'Dan'}, 	
		// Двенадцать малых пророков 
	{name:'Hos\\.', sign:'Hos'},  		//'Книга пророка Осии' 		
	{name:'Осии\\.?', sign:'Hos'},  							
	{name:'Ос\\.', sign:'Hos'},  							
	{name:'Joel\\.?', sign:'Joel'}, 	//'Книга пророка Иоиля'
	{name:'Иоиль\\.?', sign:'Joel'}, 					
	{name:'Иоил\\.', sign:'Joel'}, 					
	{name:'Јоило\\.?', sign:'Joel'}, 					
	{name:'Јоил\\.', sign:'Joel'}, 					
	{name:'Am\\.', sign:'Am'},			//'Книга пророка Амоса'	
	{name:'Амос\\.?', sign:'Am'},							
	{name:'Амс\\.', sign:'Am'},							
	{name:'Ам\\.', sign:'Am'},							
	{name:'Avd\\.', sign:'Avd'}, 		//'Книга пророка Авдия'			
	{name:'Авд\\.', sign:'Avd'}, 								
	{name:'Авдија\\.?', sign:'Avd'}, 								
	{name:'Jona\\.?', sign:'Jona'}, 	//'Книга пророка Ионы'	
	{name:'Иона\\.?', sign:'Jona'}, 						
	{name:'Ион\\.', sign:'Jona'}, 						
	{name:'Јона\\.?', sign:'Jona'}, 						
	{name:'Mic\\.', sign:'Mic'}, 		//'Книга пророка Михея'			
	{name:'Михей\\.?', sign:'Mic'}, 								
	{name:'Мих\\.', sign:'Mic'}, 								
	{name:'Мх\\.', sign:'Mic'}, 								
	{name:'Naum\\.', sign:'Naum'}, 	//'Книга пророка Наума'		
	{name:'Наум\\.?', sign:'Naum'}, 							
	{name:'Habak\\.', sign:'Habak'}, 	//'Книга пророка Аввакума'		
	{name:'Аввак\\.', sign:'Habak'}, 							
	{name:'Авак\\.', sign:'Habak'}, 							
	{name:'Авв\\.', sign:'Habak'}, 							
	{name:'Ав\\.', sign:'Habak'}, 							
	{name:'Sofon\\.', sign:'Sofon'}, 	//'Книга пророка Софонии'					
	{name:'Софон\\.', sign:'Sofon'}, 							
	{name:'Соф\\.', sign:'Sofon'}, 							
	{name:'Hag\\.', sign:'Hag'}, 		//'Книга пророка Аггея'					
	{name:'Агг\\.', sign:'Hag'}, 							
	{name:'Аг\\.', sign:'Hag'}, 							
	{name:'Агеј\\.?', sign:'Hag'}, 							
	{name:'Zah\\.', sign:'Zah'},		//'Книга пророка Захарии'						
	{name:'Захар\\.', sign:'Zah'},								
	{name:'Зах\\.', sign:'Zah'},								
	{name:'Зхр\\.', sign:'Zah'},								
	{name:'Mal\\.', sign:'Mal'},		//'Книга пророка Малахии'						
	{name:'Малах\\.', sign:'Mal'},								
	{name:'Мал\\.', sign:'Mal'},								
		// Второканонические книги
	{name:'1\\s*Mac\\.', sign:'1Mac'},		//'Первая книга Маккавейская'					
	{name:'1\\s*Мак\\.', sign:'1Mac'},							
	{name:'2\\s*Mac\\.', sign:'2Mac'}, 	//'Вторая книга Маккавейская'					
	{name:'2\\s*Мак\\.', sign:'2Mac'}, 							
	{name:'3\\s*Mac\\.', sign:'3Mac'}, 	//'Третья книга Маккавейская'					
	{name:'3\\s*Мак\\.', sign:'3Mac'}, 							
	{name:'Bar\\.', sign:'Bar'}, 		//'Книга пророка Варуха'						
	{name:'Варух\\.?', sign:'Bar'}, 								
	{name:'Вар\\.', sign:'Bar'}, 								
	{name:'2\\s*Ezr\\.', sign:'2Ezr'},		//'Вторая книга Ездры' 				
	{name:'2\\s*Ездр\\.', sign:'2Ezr'},						
	{name:'2\\s*Езд\\.', sign:'2Ezr'},						
	{name:'3\\s*Ezr\\.', sign:'3Ezr'},		//'Третья книга Ездры'				
	{name:'3\\s*Ездр\\.', sign:'3Ezr'},						
	{name:'3\\s*Езд\\.', sign:'3Ezr'},						
	{name:'Judf\\.?', sign:'Judf'}, 	//'Книга Иудифи'			
	{name:'Иудифь\\.?', sign:'Judf'}, 					
	{name:'Иудиф\\.', sign:'Judf'}, 					
	{name:'pJer\\.', sign:'pJer'}, 	//'Послание Иеремии'	
	{name:'ПослИер\\.', sign:'pJer'}, 			
	{name:'Solom\\.', sign:'Solom'}, 	//'Книга Премудрости Соломона'		
	{name:'Прем\\.', sign:'Solom'}, 				
	{name:'ПремСол\\.', sign:'Solom'}, 				
	{name:'Sir\\.', sign:'Sir'}, 		//'Книга Премудрости Иисуса, сына Сирахова' 				
	{name:'Сирах\\.?', sign:'Sir'}, 						
	{name:'Сир\\.', sign:'Sir'}, 						
	{name:'Tov\\.', sign:'Tov'}, 		//'Книга Товита'				
	{name:'Товит\\.?', sign:'Tov'}, 						
	{name:'Тов\\.', sign:'Tov'}, 						
		// Новый Завет
			// Евангилие
	{name:'Mt\\.', sign:'Mt'}, 		//'Евангелие от Матфея'				
	{name:'Мф\\.', sign:'Mt'}, 						
	{name:'Мт\\.', sign:'Mt'}, 						
	{name:'Матфея\\.?', sign:'Mt'}, 						
	{name:'Матф\\.', sign:'Mt'}, 						
	{name:'Мат\\.', sign:'Mt'}, 						
	{name:'Mk\\.', sign:'Mk'}, 		//'Евангелие от Марка'			
	{name:'Марка\\.?', sign:'Mk'}, 					
	{name:'Марк\\.?', sign:'Mk'}, 					
	{name:'Мар\\.', sign:'Mk'}, 					
	{name:'Мр\\.', sign:'Mk'}, 					
	{name:'Мк\\.', sign:'Mk'}, 					
	{name:'Lk\\.', sign:'Lk'},			//'Евангелие от Луки'			
	{name:'Луки\\.?', sign:'Lk'},						
	{name:'Лука\\.?', sign:'Lk'},						
	{name:'Лук\\.', sign:'Lk'},						
	{name:'Лк\\.', sign:'Lk'},						
//	{name:'(?<!\\b[1-3]\\s*)Jn\\.', sign:'Jn'},			//'Евангелие от Иоанна'				
//	{name:'(?<!\\b[1-3]\\s*)Иоанна\\.?', sign:'Jn'},							
//	{name:'(?<!\\b[1-3]\\s*)Иоан\\.', sign:'Jn'},							
//	{name:'(?<!\\b[1-3]\\s*)Ин\\.', sign:'Jn'},
		// Деяния и послания Апостолов
	{name:'Act\\.', sign:'Act'}, 		//'Деяния святых Апостолов'				
	{name:'Деяния\\.?', sign:'Act'}, 						
	{name:'Деян\\.', sign:'Act'}, 						
	{name:'Дела\\.?', sign:'Act'}, 						
	{name:'Jac\\.', sign:'Jac'}, 		//'Послание Иакова'						
	{name:'Иакова\\.?', sign:'Jac'}, 								
	{name:'Иаков\\.?', sign:'Jac'}, 								
	{name:'Иак\\.', sign:'Jac'}, 								
	{name:'Јаков\\.?', sign:'Jac'}, 								
	{name:'Јак\\.', sign:'Jac'}, 								
	{name:'1\\s*Pet\\.', sign:'1Pet'},		//'Первое послание Петра' 			
	{name:'1\\s*Петра\\.?', sign:'1Pet'},					
	{name:'1\\s*Петр\\.?', sign:'1Pet'},					
	{name:'1\\s*Пет\\.', sign:'1Pet'},					
	{name:'2\\s*Pet\\.', sign:'2Pet'},		//'Второе послание Петра'			
	{name:'2\\s*Петра\\.?', sign:'2Pet'},					
	{name:'2\\s*Петр\\.?', sign:'2Pet'},					
	{name:'2\\s*Пет\\.', sign:'2Pet'},					
	{name:'1\\s*Jn\\.', sign:'1Jn'}, 		//'Первое послание Иоанна'				
	{name:'1\\s*Иоанна\\.?', sign:'1Jn'}, 						
	{name:'1\\s*Иоан\\.', sign:'1Jn'}, 						
	{name:'1\\s*Ин\\.', sign:'1Jn'}, 						
	{name:'1\\s*Јов\\.', sign:'1Jn'}, 						
	{name:'1\\s*Јн\\.', sign:'1Jn'}, 						
	{name:'2\\s*Jn\\.', sign:'2Jn'}, 		//'Второе послание Иоанна'				
	{name:'2\\s*Иоанна\\.?', sign:'2Jn'}, 						
	{name:'2\\s*Иоан\\.', sign:'2Jn'}, 						
	{name:'2\\s*Ин\\.', sign:'2Jn'}, 						
	{name:'2\\s*Јов\\.', sign:'2Jn'}, 						
	{name:'2\\s*Јн\\.', sign:'2Jn'}, 						
	{name:'3\\s*Jn\\.', sign:'3Jn'}, 		//'Третье послание Иоанна'				
	{name:'3\\s*Иоанна\\.?', sign:'3Jn'}, 						
	{name:'3\\s*Иоан\\.', sign:'3Jn'}, 						
	{name:'3\\s*Ин\\.', sign:'3Jn'}, 						
	{name:'3\\s*Јов\\.', sign:'3Jn'}, 						
	{name:'3\\s*Јн\\.', sign:'3Jn'}, 						
	{name:'Jn\\.', sign:'Jn'},			//'Евангелие от Иоанна'				
	{name:'Иоанна\\.?', sign:'Jn'},							
	{name:'Иоан\\.', sign:'Jn'},							
	{name:'Ин\\.', sign:'Jn'},
	{name:'Јован\\.?', sign:'Jn'}, 
	{name:'Јов\\.', sign:'Jn'}, 						
	{name:'Јн\\.', sign:'Jn'}, 						
	{name:'Juda\\.?', sign:'Juda'}, 	//'Послание Иуды'					
	{name:'Иуды\\.?', sign:'Juda'}, 							
	{name:'Иуда\\.?', sign:'Juda'}, 							
	{name:'Иуд\\.', sign:'Juda'}, 							
	{name:'Јуда\\.?', sign:'Juda'}, 							
		// Послания апостола Павла
	{name:'Rom\\.', sign:'Rom'}, 		//'Послание апостола Павла к Римлянам'				
	{name:'Римл\\.', sign:'Rom'}, 						
	{name:'Рим\\.', sign:'Rom'}, 						
	{name:'1\\s*Cor\\.', sign:'1Cor'}, 	//'Первое послание апостола Павла к Коринфянам'					
	{name:'1\\s*Кор\\.', sign:'1Cor'}, 							
	{name:'2\\s*Cor\\.', sign:'2Cor'},		//'Второе послание апостола Павла к Коринфянам'					
	{name:'2\\s*Кор\\.', sign:'2Cor'},							
	{name:'Gal\\.', sign:'Gal'}, 		//'Послание апостола Павла к Галатам'						
	{name:'Галат\\.', sign:'Gal'}, 								
	{name:'Гал\\.', sign:'Gal'}, 								
	{name:'Eph\\.', sign:'Eph'}, 		//'Послание апостола Павла к Ефесянам'					
	{name:'Ефесян\\.', sign:'Eph'}, 							
	{name:'Ефес\\.', sign:'Eph'}, 							
	{name:'Еф\\.', sign:'Eph'}, 							
	{name:'Phil\\.', sign:'Phil'},  	//'Послание апостола Павла к Филиппийцам'		
	{name:'Филип\\.', sign:'Phil'},  				
	{name:'Филиб\\.', sign:'Phil'},  				
	{name:'Фил\\.', sign:'Phil'},  				
	{name:'Флп\\.', sign:'Phil'},  				
	{name:'Col\\.', sign:'Col'},		//'Послание апостола Павла к Колоссянам'						
	{name:'Колос\\.', sign:'Col'},								
	{name:'Кол\\.', sign:'Col'},								
	{name:'1\\s*Thes\\.', sign:'1Thes'}, 	//'Первое послание апостола Павла к Фессалоникийцам (Солунянам)'			
	{name:'1\\s*Солун\\.', sign:'1Thes'}, 					
	{name:'1\\s*Сол\\.', sign:'1Thes'}, 					
	{name:'1\\s*Фес\\.', sign:'1Thes'}, 					
	{name:'2\\s*Thes\\.', sign:'2Thes'}, 	//'Второе послание апостола Павла к Фессалоникийцам (Солунянам)'			
	{name:'2\\s*Солун\\.', sign:'2Thes'}, 					
	{name:'2\\s*Сол\\.', sign:'2Thes'}, 					
	{name:'2\\s*Фес\\.', sign:'2Thes'}, 					
	{name:'1\\s*Tim\\.', sign:'1Tim'}, 	//'Первое послание апостола Павла к Тимофею' 					
	{name:'1\\s*Тимоф\\.', sign:'1Tim'}, 							
	{name:'1\\s*Тим\\.', sign:'1Tim'}, 							
	{name:'2\\s*Tim\\.', sign:'2Tim'},		//'Второе послание апостола Павла к Тимофею'					
	{name:'2\\s*Тимоф\\.', sign:'2Tim'},							
	{name:'2\\s*Тим\\.', sign:'2Tim'},							
	{name:'Tit\\.', sign:'Tit'}, 		//'Послание апостола Павла к Титу' 						
	{name:'Титу\\.?', sign:'Tit'}, 								
	{name:'Тита\\.?', sign:'Tit'}, 								
	{name:'Тит\\.?', sign:'Tit'}, 								
	{name:'Phlm\\.', sign:'Phlm'}, 	//'Послание апостола Павла к Филимону' 				
	{name:'Филим\\.', sign:'Phlm'}, 						
	{name:'Флм\\.', sign:'Phlm'}, 						
	{name:'Hebr\\.', sign:'Hebr'}, 	//'Послание апостола Павла к Евреям'					
	{name:'Евреям\\.?', sign:'Hebr'}, 							
	{name:'Евр\\.', sign:'Hebr'}, 							
	{name:'Ев\\.', sign:'Hebr'}, 							
	{name:'Јевр\\.', sign:'Hebr'}, 							
	{name:'Apok\\.', sign:'Apok'},		//'Откровение Иоанна Богослова (Апокалипсис)'				
	{name:'Откр\\.', sign:'Apok'},					
	{name:'Отк\\.', sign:'Apok'},					
	{name:'Апок\\.', sign:'Apok'}];

var bg_bibrefs_bookTitle = [			// Полные названия Книг Священного Писания
	// Ветхий Завет
	// Пятикнижие Моисея
	{sign:'Gen', chapters: 50, title:'Книга Бытия'},						
	{sign:'Ex', chapters: 40, title:'Книга Исход'},						
	{sign:'Lev', chapters: 27, title:'Книга Левит'},						
	{sign:'Num', chapters: 36, title:'Книга Числа'},						
	{sign:'Deut', chapters: 34, title:'Второзаконие'},						
	// «Пророки» (Невиим) 
	{sign:'Nav', chapters: 24, title:'Книга Иисуса Навина'},						
	{sign:'Judg', chapters: 21, title:'Книга Судей Израилевых'},						
	{sign:'Rth', chapters: 4, title:'Книга Руфь'},						
	{sign:'1Sam', chapters: 31, title:'Первая книга Царств (Первая книга Самуила)'},						
	{sign:'2Sam', chapters: 24, title:'Вторая книга Царств (Вторая книга Самуила)'},						
	{sign:'1King', chapters: 22, title:'Третья книга Царств (Первая книга Царей)'},						
	{sign:'2King', chapters: 25, title:'Четвёртая книга Царств (Вторая книга Царей)'},						
	{sign:'1Chron', chapters: 29, title:'Первая книга Паралипоменон (Первая книга Хроник, Первая Летопись)'},						
	{sign:'2Chron', chapters: 37, title:'Вторая книга Паралипоменон (Вторая книга Хроник, Вторая Летопись)'},						
	{sign:'Ezr', chapters: 10, title:'Книга Ездры (Первая книга Ездры)'},						
	{sign:'Nehem', chapters: 13, title:'Книга Неемии'},						
	{sign:'Est', chapters: 10, title:'Книга Есфири'},						
	// «Писания» (Ктувим)
	{sign:'Job', chapters: 42, title:'Книга Иова'},						
	{sign:'Ps', chapters: 151, title:'Псалтирь'},						
	{sign:'Prov', chapters: 31, title:'Книга Притчей Соломоновых'},						
	{sign:'Eccl', chapters: 12, title:'Книга Екклезиаста, или Проповедника'},						
	{sign:'Song', chapters: 8, title:'Песнь песней Соломона'},						

	{sign:'Is', chapters: 66, title:'Книга пророка Исайи'},						
	{sign:'Jer', chapters: 52, title:'Книга пророка Иеремии'},						
	{sign:'Lam', chapters: 5, title:'Книга Плач Иеремии'},						
	{sign:'Ezek', chapters: 48, title:'Книга пророка Иезекииля'},						
	{sign:'Dan', chapters: 14, title:'Книга пророка Даниила'},						
	// Двенадцать малых пророков 
	{sign:'Hos', chapters: 14, title:'Книга пророка Осии'},						
	{sign:'Joel', chapters: 3, title:'Книга пророка Иоиля'},						
	{sign:'Am', chapters: 9, title:'Книга пророка Амоса'},						
	{sign:'Avd', chapters: 1, title:'Книга пророка Авдия'},						
	{sign:'Jona', chapters: 4, title:'Книга пророка Ионы'},						
	{sign:'Mic', chapters: 7, title:'Книга пророка Михея'},						
	{sign:'Naum', chapters: 3, title:'Книга пророка Наума'},						
	{sign:'Habak', chapters: 3, title:'Книга пророка Аввакума'},						
	{sign:'Sofon', chapters: 3, title:'Книга пророка Софонии'},						
	{sign:'Hag', chapters: 2, title:'Книга пророка Аггея'},						
	{sign:'Zah', chapters: 14, title:'Книга пророка Захарии'},						
	{sign:'Mal', chapters: 4, title:'Книга пророка Малахии'},						
	// Второканонические книги
	{sign:'1Mac', chapters: 16, title:'Первая книга Маккавейская'},						
	{sign:'2Mac', chapters: 15, title:'Вторая книга Маккавейская'},						
	{sign:'3Mac', chapters: 7, title:'Третья книга Маккавейская'},						
	{sign:'Bar', chapters: 5, title:'Книга пророка Варуха'},						
	{sign:'2Ezr', chapters: 9, title:'Вторая книга Ездры'},						
	{sign:'3Ezr', chapters: 16, title:'Третья книга Ездры'},						
	{sign:'Judf', chapters: 16, title:'Книга Иудифи'},						
	{sign:'pJer', chapters: 1, title:'Послание Иеремии'},						
	{sign:'Solom', chapters: 19, title:'Книга Премудрости Соломона'},						
	{sign:'Sir', chapters: 51, title:'Книга Премудрости Иисуса, сына Сирахова'},						
	{sign:'Tov', chapters: 14, title:'Книга Товита'},						
	// Новый Завет
	// Евангилие
	{sign:'Mt', chapters: 28, title:'Евангелие от Матфея'},						
	{sign:'Mk', chapters: 16, title:'Евангелие от Марка'},						
	{sign:'Lk', chapters: 24, title:'Евангелие от Луки'},						
	{sign:'Jn', chapters: 21, title:'Евангелие от Иоанна'},						
	// Деяния и послания Апостолов
	{sign:'Act', chapters: 28, title:'Деяния святых Апостолов'},						
	{sign:'Jac', chapters: 5, title:'Послание Иакова'},						
	{sign:'1Pet', chapters: 5, title:'Первое послание Петра'},						
	{sign:'2Pet', chapters: 3, title:'Второе послание Петра'},						
	{sign:'1Jn', chapters: 5, title:'Первое послание Иоанна'},						
	{sign:'2Jn', chapters: 1, title:'Второе послание Иоанна'},						
	{sign:'3Jn', chapters: 1, title:'Третье послание Иоанна'},						
	{sign:'Juda', chapters: 1, title:'Послание Иуды'},						
	// Послания апостола Павла
	{sign:'Rom', chapters: 16, title:'Послание апостола Павла к Римлянам'},						
	{sign:'1Cor', chapters: 16, title:'Первое послание апостола Павла к Коринфянам'},						
	{sign:'2Cor', chapters: 13, title:'Второе послание апостола Павла к Коринфянам'},						
	{sign:'Gal', chapters: 6, title:'Послание апостола Павла к Галатам'},						
	{sign:'Eph', chapters: 6, title:'Послание апостола Павла к Ефесянам'},						
	{sign:'Phil', chapters: 4, title:'Послание апостола Павла к Филиппийцам'},						
	{sign:'Col', chapters: 4, title:'Послание апостола Павла к Колоссянам'},						
	{sign:'1Thes', chapters: 5, title:'Первое послание апостола Павла к Фессалоникийцам (Солунянам)'},						
	{sign:'2Thes', chapters: 3, title:'Второе послание апостола Павла к Фессалоникийцам (Солунянам)'},						
	{sign:'1Tim', chapters: 6, title:'Первое послание апостола Павла к Тимофею'},						
	{sign:'2Tim', chapters: 4, title:'Второе послание апостола Павла к Тимофею'},						
	{sign:'Tit', chapters: 3, title:'Послание апостола Павла к Титу'},						
	{sign:'Phlm', chapters: 1, title:'Послание апостола Павла к Филимону'},						
	{sign:'Hebr', chapters: 13, title:'Послание апостола Павла к Евреям'},						
	{sign:'Apok', chapters: 22, title:'Откровение Иоанна Богослова (Апокалипсис)'}];


var bg_bibrefs_progress = 0;			// Счетчик просмотра допустимых обозначений книг Библии
var bg_bibrefs_count = 0;				// Количество найденных ссылок на Библию



/*******************************************************************************

   ЗАПУСК СКРИПТА

*******************************************************************************/  
function initBibrefsHighlight () {
	doFindAndReplace();
};
window.addEventListener('load', initBibrefsHighlight);

/*******************************************************************************

   Асинхронный поиск и подсветка ссылок на Библию 

*******************************************************************************/  
function doFindAndReplace() {
	var arrayOfWords = bg_bibrefs_url[bg_bibrefs_progress];
	var searchStr = arrayOfWords.name;
	var replaceStr = arrayOfWords.sign;
	
	if (bg_bibrefs_options.nodot && searchStr.charAt(searchStr.length-1)=='.') searchStr += '?';
	findAndReplace(searchStr, replaceStr);
	bg_bibrefs_progress++;

	if (bg_bibrefs_progress < bg_bibrefs_url.length) {
		setTimeout(doFindAndReplace, 0);
	} else bg_bibrefs_start();
}

/*******************************************************************************

   Ищем и заменяем ссылки на Библию

*******************************************************************************/  
function findAndReplace(searchStr, replaceStr, searchNode) {

    if (!searchStr || typeof replaceStr === 'undefined') {
         return;
    }
	var template = "(?:[^0-9A-zА-яёіїєґўЁІЇЄҐЎЈјЋћЂђЊњЉљЏџ]|^)(?:\\(\\s*)?("+searchStr+")\\s*((\\d{1,3}(\\s*[\\u2010-\\u2015\\-:,\\.]\\s*\\d{1,3})*)(;\\s*(\\d{1,3}(\\s*[\\u2010-\\u2015\\-:,\\.]\\s*\\d{1,3})+))*)(?:\\s*\\))?(?![0-9A-zА-яёіїєґўЁІЇЄҐЎЈјЋћЂђЊњЉљЏџ\\u2010-\\u2015\\-:])";
	var regex =  new RegExp(template, 'gm');
    var re =  new RegExp(template, '');

    var childNodes = (searchNode || document.body).childNodes;
    var cnLength = childNodes.length;
    excludes = ',html,head,style,title,link,script,object,iframe,textarea,input,button,select,a,';

	if (bg_bibrefs_options.langs) var langs = '&'+bg_bibrefs_options.langs.join('~');
	else var langs = '';
	
    while (cnLength--) {
        var currentNode = childNodes[cnLength];

		if (bg_bibrefs_options.replace && currentNode.nodeType == 1 && currentNode.nodeName.toLowerCase() == 'a') {
			found = currentNode.textContent.match(re);
			if (found && found[0] == currentNode.textContent) {
				if (currentNode.parentNode.className.indexOf('bg_bibrefs') != -1) continue;
				ref = createRreference(replaceStr, found[2]);
				
				if (ref) {
					html = 
					'<span class="bg_data_title" data-title="'+ref[0]+'" data-langs="'+langs+'"'+' title="'+ref[1]+'"'+'>'+
						'<span class="bg_data_tooltip"></span>'+
						'<a href="https://azbyka.ru/biblia/?'+ref[0]+langs+'" target="_blank">'+found[0]+'</a>'+
					'</span>';
//					currentNode.outerHTML = html;
					setContent(currentNode, html, true);
					bg_bibrefs_count++;
				}
				continue;
			}
		}
		if (currentNode.nodeType === 1 && (excludes).indexOf(',' + currentNode.nodeName.toLowerCase() + ',') === -1) {
           arguments.callee(searchStr, replaceStr, currentNode);
        }
        if (currentNode.nodeType !== 3 || !regex.test(currentNode.data) ) {
            continue;
        }		

//
		var parent = currentNode.parentNode;
		var html = currentNode.data;
		html = html.replace(/&/g, '&amp;');
		html = html.replace(/</g, '&lt;');
		html = html.replace(/>/g, '&gt;');
		
		html = html.replace(regex, function (match, p1, p2) {
			if (bg_bibrefs_options.newStyle) refStyle = ' style="'+bg_bibrefs_options.newStyle+'"';
			else refStyle = '';
				
			ref = createRreference(replaceStr, p2);
			if (ref) {
				bg_bibrefs_count++;
				smb = match.match(/^[^0-9A-zА-яёіїєґўЁІЇЄҐЎЈјЋћЂђЊњЉљЏџ(]/m);
				if (smb) match = match.slice(1);
				else smb = "";


				return smb+
				'<span class="bg_data_title" data-title="'+ref[0]+'"'+'" data-langs="'+langs+'" title="'+ref[1]+'"'+'>'+
					'<span class="bg_data_tooltip"></span>'+
					'<a href="https://azbyka.ru/biblia/?'+ref[0]+langs+'"'+refStyle+' target="_blank">'+match+'</a>'+
				'</span>';
			} else return match;
		});
		
		frag = (function(){
			wrap = document.createElement('div'),
			frag = document.createDocumentFragment();
//			wrap.innerHTML = html;
			setContent(wrap, html);
			while (wrap.firstChild) {
				frag.appendChild(wrap.firstChild);
			}
			return frag;
		})();
		parent.insertBefore(frag, currentNode);
		parent.removeChild(currentNode);
	}
}

/*******************************************************************************

   Создаем ссылку и текст всплывающей подсказки

*******************************************************************************/  
function createRreference(book, ch){
	
	// Полное наименование книги и кол-во глав
	var title="";
	var chapters = 0;
	for (i=0; i<bg_bibrefs_bookTitle.length; i++) {
		var the_book = bg_bibrefs_bookTitle[i];
		if (book == the_book['sign']){
			title = the_book['title'];
			chapters = the_book['chapters'];
			break;
		}
	}
	if (parseInt(ch) > chapters) {
		// В книгах с одной главой, допускается указывать только номер стиха
		if (chapters==1 && ch.indexOf(':')==-1) {
			ch = "1:"+ch;
		} else return false; // Номер главы больше максимального
	}
	// Убираем пробелы
	ch = ch.replace(/\s+/g,'');
	// Преобразуем все тире к стандартному виду
	ch = ch.replace(/[\u2010-\u2015]/g, '-');

	// Проверяем, не примеяется ли западная нотация?
	if (isWesternNotation (ch, chapters)) {
		// Заменяем запятую на двоеточие, оставляя запятые как разделители глав
		var prevDelimeter=',';
		ch = ch.replace(/[-:,\\.;]/g,function (match) {
			if (match == ',' && (prevDelimeter == ',' || prevDelimeter == ';')) match = ':';
			prevDelimeter = match;
			return match;
		});		
	}
	// Заменяем точку на запятую
	ch = ch.replace(/\./g,',');		
   return [book+'.'+ch, title+' '+ch];
}

/*******************************************************************************

   Проверяем, является ли запись западной нотацией

*******************************************************************************/  
function isWesternNotation (ch, chapters) {
	if (ch.match(/^(\d{1,3}),/m)) {							// Если после первой цифры идет запятая 
		if (ch.match(/[.\-]/g)) return true;				// и при этом выражение содержит точку или тире
		// Особый случай: два числа, разделенных запятой
		if (ch.match(/^\d{1,3},\d{1,3}$/m)) {
			var arr = ch.split(',');
			// Западная нотация всегда если:
			if (parseInt(arr[0]) >= parseInt(arr[1]) ||		// Первая цифра больше или равна второй
				parseInt(arr[1]) > chapters)				// Вторая цифра больше кол-ва глав в книге
				return true;
			if (!bg_bibrefs_options.collision) return true;			// Опция отключена - западная нотация
		}
	}
	return false;
}

/*******************************************************************************

    Формирование текста отрывка из Библии
   
*******************************************************************************/  
function bg_bibrefs_parseRefs(obj) {
	var txt = "";
	for (i=0; i<obj.content.length; i++) {
		let c_obj = obj.content[i];
		var text = c_obj.passage[0].text;
		if (bg_bibrefs_options.crossRefs) var cross_refs = bg_bibrefs_crossReferences(c_obj.cross_refs);
		else var cross_refs = "";
		text = text.replace(/<\/?a[^>]*(>|$)/g, "");
		ref = c_obj.chapter+":"+c_obj.verse;
		if (bg_bibrefs_options.interpretation) interpret = obj.book+'.'+ref+'&'+c_obj.passage[0].iso_code;
		else interpret = "";
		if (interpret) {
			txt += '<sup>'+ref+'</sup> <a href="https://azbyka.ru/biblia/in/?'+interpret+'" title="Перейти к толкованиям Библии" target="_blank">'+text+'</a>'+cross_refs+'<br>';
		} else {	
			txt += "<sup>"+ref+"</sup> "+text+cross_refs+"<br>";
		}
	}
	return txt;
	
}
/*******************************************************************************

   Перекрестые ссылки для стиха Библии
   
*******************************************************************************/  
function bg_bibrefs_crossReferences(obj) {
	var txt = "";
	for (var i in obj) {
		txt += '<a href="https://azbyka.ru/biblia/?'+obj[i].en+'" target="_blank">' + obj[i].ru + '</a>, ';
	}
	if (txt) {
		txt = txt.slice(0, -2);
		txt = ' <span class="bg_cross_refs">('+txt+')</span>';
	}
	return txt;
}

/*******************************************************************************

   Безопасное внедрение html 

*******************************************************************************/  
function setContent(target, data, outer=false) {
	target.innerText="";
	if (!data) return;

	//создаем объект DOMParser
	var parser = new DOMParser();  
	// data - это текст который мы хотим распарсить. 
	// Второй аргумент, это MIME-тип, для XML - "application/xml", для SVG - "image/svg+xml") 
	data = '<div class="extContent">'+data+'</div>';
	var node = parser.parseFromString(data, "text/html");

	// Очистим html от лишних тегов и атрибутов
	node = DOMSanitizer.clear(node);

	var parent = node.getElementsByClassName("extContent")[0];
	// Вставим в html в нужное место
	if (outer) {
		target.parentNode.insertBefore(parent.firstChild, target);
		target.parentNode.removeChild(target);
	} else target.appendChild(parent);
	
	// Удалим div class="extContent"
	while (parent.firstChild)	{
		parent.parentNode.insertBefore(parent.firstChild,	parent);
	}
	parent.parentNode.removeChild(parent);

}

/*******************************************************************************

	Based on JavaScript HTML Sanitizer, (c) Alexander Yumashev, Jitbit Software.
	homepage https://github.com/jitbit/HtmlSanitizer
	License: GNU GPL v3 https://github.com/jitbit/HtmlSanitizer/blob/master/LICENSE
	
*******************************************************************************/  

var DOMSanitizer = new (function () {

	var tagWhitelist_ = {
		'BODY': true, 'DIV': true, 'P': true, 'SPAN': true, 'LABEL': true, 
		'H1': true, 'H2': true, 'H3': true, 'H4': true, 'H5': true, 'H6': true, 
		'OL': true, 'UL': true, 'LI': true, 'HR': true, 'BR': true, 
		'A': true,  'IMG': true,
		'B': true, 'BLOCKQUOTE': true,'CENTER': true, 'CODE': true, 'EM': true, 'U': true, 'I': true, 'PRE': true, 'SMALL': true, 'STRONG': true, 'SUP': true, 'SUB': true,
		'SELECT': true, 'OPTION': true, 'INPUT': true, 'BUTTON': true,
		'TABLE': true, 'TBODY': true, 'TR': true, 'TD': true, 'TH': true, 'THEAD': true,
		'VIDEO': true, 'AUDIO': true
	};
	var contentTagWhiteList_ = { 'FORM': true }; //tags that will be converted to DIVs
	var attributeWhitelist_ = { 
		'id': true, 'name': true, 'type': true, 'class': true, 'value': true, 
		'style': true, 'align': true, 'color': true, 'height': true, 'width': true, 
		'href': true, 'src': true, 
		'target': true, 'controls': true, 
		'title': true, 'placeholder': true,
		'colspan': true, 'cellpadding': true,
		'data-url': true, 'data-ref': true, 'data-title': true, 'data-title1': true, 'data-title2': true, 'data-langs': true
	};
	var cssWhitelist_ = { 
		'color': true, 'background-color': true, 'font-size': true,  'text-decoration': true, 'font-weight': true,
		'vertical-align': true, 'text-align': true, 'width': true 
	};
	var schemaWhiteList_ = { 'http': true, 'https': true}; //which "protocols" are allowed in "href", "src" etc
	var uriAttributes_ = { 'src': true, 'href': true, 'data-url': true };

	this.clear = function(input) {
		var clone = input.cloneNode(true);

		function makeSanitizedCopy(node) {
			if (node.nodeType == Node.TEXT_NODE) {
				var newNode = node.cloneNode(true);
			} else if (node.nodeType == Node.ELEMENT_NODE && (tagWhitelist_[node.tagName] || contentTagWhiteList_[node.tagName])) {

				if (contentTagWhiteList_[node.tagName])
					newNode = clone.createElement('DIV'); //convert to DIV
				else
					newNode = clone.createElement(node.tagName);

				for (var i = 0; i < node.attributes.length; i++) {
					var attr = node.attributes[i];
					if (attributeWhitelist_[attr.name]) {
						if (attr.name == "style") {
							for (s = 0; s < node.style.length; s++) {
								var styleName = node.style[s];
								if (cssWhitelist_[styleName])
									newNode.style.setProperty(styleName, node.style.getPropertyValue(styleName));
								else
									if (bg_bibrefs_options.log) console.log("Removed Style: "+styleName+" from Attr: "+attr.name+" of Tag: "+node.tagName+" see > "+node.outerHTML);
							}
						}
						else {
							if (uriAttributes_[attr.name]) { //if this is a "uri" attribute, that can have "javascript:" or something
								var schema = attr.value.split(':')[0];
								var path = attr.value.split(':')[1];
								if (path && !schemaWhiteList_[schema]) {
									if (bg_bibrefs_options.log) console.log("Not Allowed Schema: "+schema+" in Attr: "+attr.name+" of Tag: "+node.tagName+" see > "+node.outerHTML);
									continue;
								}
							}
							newNode.setAttribute(attr.name, attr.value);
						}
					} else {
						if (bg_bibrefs_options.log) console.log("Removed Attr: "+attr.name+"="+attr.value+" from Tag: "+node.tagName+" see > "+node.outerHTML);
					} 
				}
				for (i = 0; i < node.childNodes.length; i++) {
					var subCopy = makeSanitizedCopy(node.childNodes[i]);
					newNode.appendChild(subCopy, false);
				}
			} else {
				newNode = document.createDocumentFragment();
				if (bg_bibrefs_options.log) console.log("Removed Tag: "+node.tagName+" see > "+node.outerHTML);
			}
			return newNode;
		};

		var resultElement = makeSanitizedCopy(clone.body);
		return resultElement;
	}

	this.AllowedTags = tagWhitelist_;
	this.AllowedAttributes = attributeWhitelist_;
	this.AllowedCssStyles = cssWhitelist_;
	this.AllowedSchemas = schemaWhiteList_;
});


/* ============================================================================================== *

	ВСПЛЫВАЮЩЕЕ ОКНО

 * ============================================================================================== */
// Хранилище для заданных значений ширины, максимальной высоты и вертикального положения подсказки
var bg_bibrefs_tipWidth;
var bg_bibrefs_tipMaxHeight;	
var bg_bibrefs_tipTop;	

/*******************************************************************************

   При создании страницы для всех элементов 'a.bg_data_title' 
   запрашивает текст Библии и заполняет всплывающую подсказку
   
*******************************************************************************/  
function bg_bibrefs_start(){
	
	if (!bg_bibrefs_options.popup) return;

	// Сохраняем заданные значения ширины, максимальной высоты и вертикального положения подсказки
	var tooltip = jQuery('span.bg_data_tooltip:first');	
	bg_bibrefs_tipWidth = parseInt(tooltip.css('width'));
	bg_bibrefs_tipMaxHeight = parseInt(tooltip.css('max-height'));	
	bg_bibrefs_tipTop = parseInt(tooltip.css('top'));	
	var langs = '&'+bg_bibrefs_options.popup_lang;
	
	jQuery('span.bg_data_title').each (function(){
		var el = jQuery(this);
		var tooltip = el.children('span.bg_data_tooltip');	
		if (tooltip.css('position')=='fixed') return;
		var ref = el.attr('data-title');
//		var langs = el.attr('data-langs');

		if (ref != "") {						// Книга задана
			// Текст Библии
			var verses = "";
			var xhr = new XMLHttpRequest();
			xhr.open("GET", 'https://azbyka.ru/biblia/api/v1/pages?'+ref+langs, true);
			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4 && xhr.status == 200) {
					var obj = JSON.parse(xhr.responseText);
					verses = bg_bibrefs_parseRefs(obj);
					verses = "<span class='bg_data_verses'>"+verses+"</span>";
					var book_title = "<div class='bibref__title'><img class='bg_expand_button' data-title1='Развернуть' data-title2='Скрыть' />"+
						"<strong><a href='https://azbyka.ru/biblia/?"+ref+langs+"' title='Перейти к тексту Библии' target='_blank'>"+obj.book_title+"</a></strong></div>";
					// Добавляем стихи в подсказку
//						tooltip.html(book_title + verses);		
					setContent(tooltip.get(0), book_title + verses);
					el.attr('data-title', "");
					el.attr('title', "");
				}
					
			}
			xhr.send();	
		}
	});

/*******************************************************************************

   При наведении мыши на ссылку, если подсказка не пуста, 
   отображает подсказку на экране
   
*******************************************************************************/  
var bg_bibrefs_intervalID;

jQuery('span.bg_data_title')
	.mouseenter(function(e){
		var el = jQuery(this);
		var tooltip = el.children('span.bg_data_tooltip');	
		if (tooltip.css('position')=='fixed') return;

	// Выводим подсказку на экран
		tooltip_mini(tooltip, el, e);
	})
/*******************************************************************************

   При удалении мыши от ссылки, удаляет подсказку с экрана
   
*******************************************************************************/  
	.mouseleave (function(){
		clearInterval(bg_bibrefs_intervalID);
		var tooltip = jQuery(this).children('span.bg_data_tooltip');
		if (tooltip.css('position')=='fixed') return;
		tooltip.css('display', "none");
	});
} 

/*******************************************************************************

   Отображение подсказки под ссылкой
   
*******************************************************************************/  
function tooltip_mini(tooltip, el, e) {	
	if (!tooltip.html()) return;
	// Восстанавливаем заданные значения ширины, максимальной высоты и вертикального положения подсказки 
	tooltip.css({
		'width': bg_bibrefs_tipWidth+"px",		// Восстанавливаем заданную ширину подсказки
		'max-height': bg_bibrefs_tipMaxHeight+"px",	// Восстанавливаем заданную максимальную высоту подсказки
		'top': bg_bibrefs_tipTop+"px",			// Восстанавливаем вертикальное положение подсказки
		'position':'absolute',					// Абсолютная позиция
		'display': "block"						// Строчно-блочный элемент 
	});
	tooltip.children('span').css({
		'margin':  '5px -5px -5px -10px',		// Отступ
		'padding': '5px 5px 5px 10px',			// Поля 
		'overflow-y': 'auto', 					// Разрешить при необходимости скроллинг по вертикали 
		'overflow-x': 'hidden', 				// Запретить скроллинг по горизонтали 
		'border-top': "1px solid #767676" 		// Параметры рамки 
	});

	var padding = parseInt(tooltip.css('paddingLeft'))+parseInt(tooltip.css('paddingRight'))+parseInt(tooltip.css('border-Left-Width'))+parseInt(tooltip.css('border-Right-Width'));
	// Координаты контейнера, внутри которого будут отображаться подсказки. Например для <div id="content">, это "#content"
	var content = jQuery('#content1');
	if (content.length < 1) content = jQuery('body');	// Если тема не содержит, указанный контейнер, то определяем положение body
	var c_left = content.position().left+parseInt(content.css('paddingLeft'))+parseInt(content.css('marginLeft'))+parseInt(content.css('border-Left-Width'));
	var c_right =c_left+content.width();
//	alert(c_left+" "+c_right);
	
	var tipWidth = parseInt(tooltip.css('width'));	// Заданная ширина подсказки

	var pos = el.offset();						// Позиция родительского элемента
	var x = e.pageX-(el.offset().left-pos.left)-12;	// Получаем координаты по оси X - 12
	
	var y =  pos.top+el.height(); 					// Получаем координаты по оси Y
	tooltip.css('height', "auto");					// Высота определяется автоматически
	var tipHeight = tooltip.height(); 				// Вычисляем высоту подсказки

	// Подсказка не должна выходить за пределы контейнера
	if (tipWidth+padding > content.width()) tipWidth = content.width()-padding;
	if (x < c_left) x = c_left;
	if (x+tipWidth+padding > c_right) x = c_right-tipWidth-padding-1;

	// Задаем размеры контейнера с текстом
	container = tooltip.children('span');
	var padding_w = parseInt(container.css('marginLeft'))+parseInt(container.css('marginRight'))+parseInt(container.css('paddingLeft'))+parseInt(container.css('paddingRight'))+parseInt(container.css('border-Left-Width'))+parseInt(container.css('border-Right-Width'));
	var divWidth = tipWidth - padding_w;
	var padding_h = parseInt(container.css('paddingTop'))+parseInt(container.css('paddingBottom'))+parseInt(container.css('border-Top-Width'))+parseInt(container.css('border-Bottom-Width'));
	var divHeight = parseInt(tooltip.css('max-height')) - container.position().top - padding_h;
	container.css({
		'width': divWidth+"px",
		'max-height': divHeight+"px"
	});

	// Определяем дистанцию от ниждего края окна браузера до блока, содержащего подсказку        
	tipHeight = tooltip.height(); 				// Вычисляем высоту подсказки
	var tipVisY = jQuery(window).scrollTop()+jQuery(window).height() - (y + tipHeight+(pos.top-el.position().top));
	if ( tipVisY < 20 ) { // Если высота подсказки превышает расстояние от нижнего края окна браузера до курсора,
		y = pos.top-tipHeight-el.height()/2;  		// то распологаем область с подсказкой над курсором
	} 
	//Присваиваем найденные координаты области, содержащей подсказку
	x = Math.round(x);							
	y = Math.round(y);

	tooltip.css({
		'width': tipWidth+"px",
//		'left': x+"px",
		'position':'absolute',					// Абсолютная позиция
		'display': "block"						// Строчно-блочный элемент 
	});	
	tooltip.offset({top:y, left:x});
	// Назначаем название и действие кнопке
	var img = jQuery('span.bg_data_tooltip img');
	img.unbind();								// Удаляем все обработчики событий
	img.attr('title', img.attr('data-title1'));		//  Название 1
	img.click (function () {
		var tooltip = jQuery(this).closest('span.bg_data_tooltip');	
		tooltip.css({
			'position': 'absolute',				// Абсолютная позиция
			'display': "none"					// Скрыть подсказку
		});
		tooltip_maxi(tooltip);					// Развернуть подсказку			
	});
/*
	// Выделение текста по щелчку
	tooltip.children('span').click(function() {
		var e=this; 
		if(window.getSelection){ 
			var s=window.getSelection(); 
			if(s.setBaseAndExtent){ 
				s.setBaseAndExtent(e,0,e,e.childNodes.length-1); 
			}else{ 
				var r=document.createRange(); 
				r.selectNodeContents(e); 
				s.removeAllRanges(); 
				s.addRange(r);
			} 
		}else if(document.getSelection){ 
			var s=document.getSelection(); 
			var r=document.createRange(); 
			r.selectNodeContents(e); 
			s.removeAllRanges(); 
			s.addRange(r); 
		}else if(document.selection){ 
			var r=document.body.createTextRange(); 
			r.moveToElementText(e); 
			r.select();
		}
	});
*/
}	
/*******************************************************************************

   Отображение подсказки посередине экрана
   
*******************************************************************************/  
function tooltip_maxi(tooltip) {

	// Создаем блок для затемнения фона в том же контексте, при этом z-index должен быть меньше чем у tooltip
	var data_title=jQuery(tooltip).parent();
	jQuery("<div/>", { "id": "bg_BG_overlay" }).appendTo(data_title);
	// Восстанавливаем заданные значения ширины, максимальной высоты и вертикального положения подсказки 
	tooltip.css({
		'width': bg_bibrefs_tipWidth+"px",			// Восстанавливаем заданную ширину подсказки
		'max-height': bg_bibrefs_tipMaxHeight+"px",	// Восстанавливаем заданную максимальную высоту подсказки
		'top': bg_bibrefs_tipTop+"px",				// Восстанавливаем вертикальное положение подсказки
		'position':'fixed',						// Фиксированная позиция
		'display': "block"						// Строчно-блочный элемент 
	});
	var padding = parseInt(tooltip.css('paddingLeft'))+parseInt(tooltip.css('paddingRight'))+parseInt(tooltip.css('border-Left-Width'))+parseInt(tooltip.css('border-Right-Width'));
	// Координаты body (размещаем по центру экрана)
	var content = jQuery('body');
	var cc_left = content.offset().left+parseInt(content.css('paddingLeft'))+parseInt(content.css('border-Left-Width'));

	var tipWidth = content.width()-padding-40;
	var tipWidthMax = parseInt(tooltip.css('max-width'));
	if (tipWidth > tipWidthMax) tipWidth = tipWidthMax;
	var tipHeight = jQuery(window).height() - 2*bg_bibrefs_tipTop;
	tooltip.css({
		'width': tipWidth+"px",
		'max-height': tipHeight+"px",
		'height': "auto"
	});
	tipWidth = tooltip.width();
	var x = cc_left+(content.width() - tipWidth-padding)/2;

	// Задаем размеры контейнера с текстом
	container = tooltip.children('span');
	var padding_w = parseInt(container.css('marginLeft'))+parseInt(container.css('marginRight'))+parseInt(container.css('paddingLeft'))+parseInt(container.css('paddingRight'))+parseInt(container.css('border-Left-Width'))+parseInt(container.css('border-Right-Width'));
	var divWidth = tipWidth - padding_w;
	var padding_h = parseInt(container.css('paddingTop'))+parseInt(container.css('paddingBottom'))+parseInt(container.css('border-Top-Width'))+parseInt(container.css('border-Bottom-Width'));
	var divHeight = tipHeight - container.position().top - padding_h;
	container.css({
		'width': divWidth+"px",
		'max-height': divHeight+"px"
	});
	tipHeight = tooltip.height();
	var y = (jQuery(window).height() - tipHeight)/2;
	

	//Присваиваем найденные координаты области, содержащей подсказку
	x = Math.round(x);							
	y = Math.round(y);
	tooltip.css({
		'width': tipWidth+"px",
		'top': y+"px",
		'left': x+"px",
		'position':'fixed',						// Фиксированная позиция
		'display': "block"						// Строчно-блочный элемент 
	});	
	// Назначаем название и действие кнопке
	var img = jQuery('span.bg_data_tooltip img');
	img.unbind();								// Удаляем все обработчики событий
	img.attr('title', img.attr('data-title2'));		//  Название 2
	img.click (function () {					// Щелчок по кнопке
		jQuery(this).closest('span.bg_data_tooltip').css({
			'position': 'absolute',				// Абсолютная позиция
			'display': "none"					// Скрыть подсказку
		});
		jQuery( "div" ).remove( "#bg_BG_overlay" );	// Удаляем блок затемнения фона
	});
	jQuery(document).unbind();
	jQuery(document).click(function(event) {	// Щелчок за пределами подсказки
		if (jQuery(event.target).closest("span.bg_data_tooltip").length) return;
		jQuery('span.bg_data_tooltip').css({
			'position': 'absolute',				// Абсолютная позиция
			'display': "none"					// Скрыть подсказку
		});
		jQuery( "div" ).remove( "#bg_BG_overlay" );	// Удаляем блок затемнения фона
	});
}
