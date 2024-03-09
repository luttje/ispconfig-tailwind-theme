ISPConfig.loadResponsiveMenu = function () {
    // Off-Canvas Menu
    const $mainNavigation = $('#main-navigation');
    const $subNavigation = $('#sidebar');
    const responsiveNavigation = document.querySelector('#responsive-navigation')

    responsiveNavigation.innerHTML = '<div class="self-end items-center cursor-pointer mb-2 px-4 py-2 lg:hidden rounded hover:text-black hover:bg-white" @click="sidebarOpen = !sidebarOpen">&#10005;</div>';

    const menuList = document.createElement('ul');
    menuList.classList.add('flex', 'flex-col', 'gap-2');
    responsiveNavigation.appendChild(menuList);

    var $addTo = false;
    $($mainNavigation).find('a').each(function () {
        var $item = $(this);
        var isActive = $item.hasClass('active');
        var $activeClass = isActive ? 'class="active flex flex-row gap-2 items-center px-4 py-2 rounded bg-white text-black"' : 'class="flex flex-row gap-2 items-center px-4 py-2 rounded hover:text-black hover:bg-white"';

        var capp = $item.attr('data-capp');
        if (capp) $activeClass += ' data-capp="' + capp + '"';

        capp = $item.attr('data-load-content');
        if (capp) $activeClass += ' data-load-content="' + capp + '"';

        var $newElement = $('<li><a href="' + $item.attr('href') + '" @click="sidebarOpen = false" ' + $activeClass + '><i class="icon ' + $item.data('icon-class') + '"></i>' + $item.text() + '</a></li>');
        if (isActive != '') $addTo = $newElement;
        $newElement.appendTo(menuList);
    });

    // Subnavigation
    if (!$addTo) $addTo = $(menuList);
    const subNavigationList = document.createElement('ul');
    subNavigationList.classList.add('flex', 'flex-col', 'gap-2', 'my-2', 'subnavi');
    $addTo.append(subNavigationList);

    $($subNavigation).find('a').each(function () {
        let $item = $(this);

        let additionalAttribute = '';
        let capp = $item.attr('data-capp');
        if (capp) additionalAttribute += ' data-capp="' + capp + '"';

        capp = $item.attr('data-load-content');
        if (capp) additionalAttribute += ' data-load-content="' + capp + '"';

        capp = $item.hasClass('subnav-header');
        let classes = '';
        if (capp) {
            classes = 'subnav-header text-gray-400 text-sm';
        }

        // $responsiveNavigation.find('ul.subnavi').append($('<li><a href="' + $item.attr('href') + '"' + addattr + ' class="!flex flex-row items-center font-normal">' + $item.text() + '</a></li>'));
        $addTo.find('ul.subnavi').append($('<li><a href="' + $item.attr('href') + '"' + additionalAttribute + ' class="' + classes + ' flex flex-row items-center font-normal px-4 py-2 rounded hover:text-black hover:bg-white" @click="sidebarOpen = false">' + $item.text() + '</a></li>'));
    });
};
