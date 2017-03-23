$(function initializeMap() {

    const fullstackAcademy = new google.maps.LatLng(40.705086, -74.009151);

    const styleArr = [{
            featureType: 'landscape',
            stylers: [{ saturation: -100 }, { lightness: 60 }]
        },
        {
            featureType: 'road.local',
            stylers: [{ saturation: -100 }, { lightness: 40 }, { visibility: 'on' }]
        },
        {
            featureType: 'transit',
            stylers: [{ saturation: -100 }, { visibility: 'simplified' }]
        },
        {
            featureType: 'administrative.province',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'water',
            stylers: [{ visibility: 'on' }, { lightness: 30 }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#ef8c25' }, { lightness: 40 }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ visibility: 'off' }]
        },
        {
            featureType: 'poi.park',
            elementType: 'geometry.fill',
            stylers: [{ color: '#b6c54c' }, { lightness: 40 }, { saturation: -40 }]
        }
    ];

    const mapCanvas = document.getElementById('map-canvas');

    const currentMap = new google.maps.Map(mapCanvas, {
        center: fullstackAcademy,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: styleArr
    });

    // const iconURLs = {
    //   hotel: '/images/lodging_0star.png',
    //   restaurant: '/images/restaurant.png',
    //   activity: '/images/star-3.png'
    // };

    function drawMarker(type, coords) {
        // TODO: Pan map / recalculate viewport here maybe?
        const latLng = new google.maps.LatLng(coords[0], coords[1]);
        const marker = new google.maps.Marker({
            position: latLng
        });
        marker.setMap(currentMap);
        return marker
    }







    // 0. Fetch the database, parsed from json to a js object
    const db = fetch('/api/options').then(r => r.json())


    // TODO:
    // 1. Populate the <select>s with <option>s
    $('select').each(
        (_index, select) => {
            db.then(db =>
                $(select).append(
                    db[select.dataset.type].map(
                        item => Object.assign(
                            $(`<option>${item.name}</option>`)[0], {
                                item: item,
                            })
                    )
                )
            )
        })

    // What we wrote: (less elegant and functional than Ashi's)
    // $.get('/api/options')
    //     .then(function (data) {
    //         return Promise.all([data.hotels, data.restaurants, data.activities]);
    //     })
    //     .then(function (data) {
    //         var hotels = data[0];
    //         var restaurants = data[1];
    //         var activities = data[2];

    //         hotels.forEach(function (hotel) {
    //             $('#hotels').append(`<option>${hotel.name}</option>`)
    //         })
    //         restaurants.forEach(function (restaurant) {
    //             $('#restaurants').append(`<option>${restaurant.name}</option>`);
    //         })
    //         activities.forEach(function (activity) {
    //             $('#activities').append(`<option>${activity.name}</option>`)
    //         })
    //     })
    //     .catch(console.error.bind(console));

    // 2. Wire up the add buttons
    // We could do this if we wanted to select by the add
    // dataset item instead:
    //
    //   $('button[data-action="add"]').click(
    $('button.add').click(
        evt =>
        $(evt.target.dataset.from)
        .find('option:selected')
        .each((_i, option) => {
            const item = option.item,
                type = $(option)
                .closest('select')[0]
                .dataset.type
            // Make a li out of this item
            const li = $(`<li>${item.name} <button class='del'>x</button></li>`)[0]

            if ($('.current.day').has(li).length) {
                // console.log('our if statement: ', $('.current.day').has(li));
                // console.log('you already have this item!')
            } else {
                // Draw a marker on the map and attach the marker to the li
                li.marker = drawMarker(type, item.place.location)

                // Add this item to our itinerary for the current day
                $('.current.day').append(li)
                var dayId = $('.current.day').index() + 1;
                console.log(dayId);
                // Add an ajax method onto this button
                // we can use AJAX to write our url such that our router can access the urls
                $.ajax({
                    method: 'PUT',
                    url: 'api/days/' + dayId + '/' + type,
                    data: {
                        id: item.id
                    } // what we want to pass to the router as req.body

                })
            }




        })
    );

    // 3. Wire up delete buttons
    $(document).on('click', 'button.del',
        evt => $(evt.target).closest('li').each((_i, li) => {
            li.marker.setMap(null)
            var name = $(li).text().slice(0, -1);
            $(li).remove();
            var dayId = $('.current.day').index() + 1;
            console.log("Here's our shit.", dayId, name);
            $.ajax({
                    method: 'DELETE',
                    url: 'api/days/' + dayId,
                    data: {
                        name: name,
                        id: item.id,
                        type: type
                    } // what we want to pass to the router as req.body

                })
        })
    )

    // 4. Deal with adding days
    $('button.addDay').click(
        evt => {
            // Deselect all days
            $('.day.current').removeClass('current')

            // Add a new day
            $(evt.target).before(
                $(`<ol class="current day"><h3><span class=day-head></span><button class=delDay>x</button></h3></ol>`)
            )
            //console.log($('.day.current').index());
            var dayId = ($('.day.current').index()) + 1;
            numberDays()
            $.ajax({
                    method: 'POST',
                    url: 'api/days/' + dayId 
            })
            .then(function (data) { console.log('POST response data: ', data) })
            .catch(console.error.bind(console));
        }
    )

    function numberDays() {
        $('.day').each((index, day) =>
            $(day).find('.day-head').text(`day ${index + 1}`)
        )
    }

    // 5. Deal with switching days
    $(document).on('click', '.day-head',
        evt => {
            $('.day.current').removeClass('current')
            const $day = $(evt.target).closest('.day')

            $('li').each((_i, li) => li.marker && li.marker.setMap(null))
            $day.addClass('current')
            $day.find('li').each((_i, li) => li.marker.setMap(currentMap))
        }
    )

    // 6. Remove a day
    $(document).on('click', 'button.delDay',
        evt => {
            const $day = $(evt.target).closest('.day')
            if ($day.hasClass('current')) {
                const prev = $day.prev('.day')[0],
                    next = $day.next('.day')[0]
                $day.removeClass('current')
                $(prev || next).addClass('current')
            }

            $day.find('li').each((_i, li) => li.marker.setMap(currentMap))
            $day.remove()
            numberDays()
        })

    // When we start, add a day
    $('button.addDay').click()




});