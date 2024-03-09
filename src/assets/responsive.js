ISPConfig.loadResponsiveMenu = function () {
    // Off-Canvas Menu
    const mainNavigation = document.querySelector('#main-navigation');
    const subNavigation = document.querySelector('#sidebar');
    const responsiveNavigation = document.querySelector('#responsive-navigation');

    responsiveNavigation.innerHTML = '<div class="self-end items-center cursor-pointer mb-2 px-4 py-2 lg:hidden rounded hover:text-black hover:bg-white" @click="sidebarOpen = !sidebarOpen">&#10005;</div>';

    const menuList = document.createElement('ul');
    menuList.classList.add('flex', 'flex-col', 'gap-2');
    responsiveNavigation.appendChild(menuList);

    let addTo = false;
    mainNavigation.querySelectorAll('a').forEach(function(item) {
        let isActive = item.classList.contains('active');
        let activeClass = isActive ? 'active flex flex-row gap-2 items-center px-4 py-2 rounded bg-white text-black' : 'flex flex-row gap-2 items-center px-4 py-2 rounded hover:text-black hover:bg-white';

        let capp = item.getAttribute('data-capp');
        if (capp) activeClass += ' data-capp="' + capp + '"';

        capp = item.getAttribute('data-load-content');
        if (capp) activeClass += ' data-load-content="' + capp + '"';

        let iconClass = item.dataset.iconClass ? item.dataset.iconClass : '';
        let newElement = document.createElement('li');
        newElement.innerHTML = '<a href="' + item.getAttribute('href') + '" @click="sidebarOpen = false" class="' + activeClass + '"><i class="icon ' + iconClass + '"></i>' + item.textContent + '</a>';

        if (isActive) addTo = newElement;
        menuList.appendChild(newElement);
    });

    // Subnavigation
    if (!addTo) addTo = menuList;
    const subNavigationList = document.createElement('ul');
    subNavigationList.classList.add('flex', 'flex-col', 'gap-2', 'my-2', 'subnavi');
    addTo.appendChild(subNavigationList);

    subNavigation.querySelectorAll('a').forEach(function(item) {
        let additionalAttribute = '';
        let capp = item.getAttribute('data-capp');
        if (capp) additionalAttribute += ' data-capp="' + capp + '"';

        capp = item.getAttribute('data-load-content');
        if (capp) additionalAttribute += ' data-load-content="' + capp + '"';

        let classes = item.classList.contains('subnav-header') ? 'subnav-header text-gray-400 text-sm' : '';

        let newElement = document.createElement('li');
        newElement.innerHTML = '<a href="' + item.getAttribute('href') + '" ' + additionalAttribute + ' class="' + classes + ' flex flex-row items-center font-normal px-4 py-2 rounded hover:text-black hover:bg-white" @click="sidebarOpen = false">' + item.textContent + '</a>';
        subNavigationList.appendChild(newElement);
    });
};
