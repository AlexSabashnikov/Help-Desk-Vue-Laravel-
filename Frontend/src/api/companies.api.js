/**
 * Сервис справочника компаний-клиентов
 * Получение списка компаний, поиск, автодополнение
 * Детальная информация о компании и её контактных лицах
 * Используется при создании/редактировании заявок
 */

export const organizationsApi = {
  async getOrganizations() {
    // Тестовые данные организаций
    const allOrganizations = [
        {
        id: 1,
        name: 'ООО "Сервис Печати"',
        type_agent: 1,
        type_org: 4, // our_company
        inn: '',
        kpp: '',
        ogrn: '',
        objects: [
          {
            id: 6001,
            name: 'Главный офис',
            address: 'г. Нижний Новгород, ул. Советская, д. 7',
            is_main: true,
            contacts: [
              {
                id: 701,
                full_name: 'Левченко Сергей Павлович',
                phone: '+7 (999) 555-77-88',
                email: 'test@email.ru',
                is_main: true
              },
              {
                id: 702,
                full_name: 'Григорьев Антон Павлович',
                phone: '+7 (999) 663-77-99',
                email: 'a.grigoriev@infotech.ru',
                is_main: false
              },
              {
                id: 703,
                full_name: 'Григорьев Антон Павлович',
                phone: '+7 (999) 663-77-99',
                email: 'a.grigoriev@infotech.ru',
                is_main: false
              },
              {
                id: 704,
                full_name: 'Григорьев Антон Павлович',
                phone: '+7 (999) 663-77-99',
                email: 'a.grigoriev@infotech.ru',
                is_main: false
              },
              {
                id: 705,
                full_name: 'Григорьев Антон Павлович',
                phone: '+7 (999) 663-77-99',
                email: 'a.grigoriev@infotech.ru',
                is_main: false
              },
              {
                id: 706,
                full_name: 'Григорьев Антон Павлович',
                phone: '+7 (999) 663-77-99',
                email: 'a.grigoriev@infotech.ru',
                is_main: false
              }
            ]
          },
          {
            id: 6002,
            name: 'Центр обработки данных',
            address: 'г. Москва, ул. Вычислительная, д. 5',
            is_main: false,
            contacts: [
              {
                id: 703,
                full_name: 'Никитин Павел Андреевич',
                phone: '+7 (999) 666-78-00',
                email: 'p.nikitin@infotech.ru',
                is_main: false
              }
            ]
          }
        ],
        bank_details: {
          bank_name: 'ПАО Сбербанк',
          bik: '',
          account: '',
          corr_account: ''
        },
        created_at: '2026-01-21T14:25:35.000000Z',
        updated_at: '2026-01-28T15:40:20.000000Z'
      },
      {
        id: 2,
        name: 'ООО "Технологии Будущего"',
        type_agent: 1, 
        type_org: 1, 
        inn: '7701234567',
        kpp: '770101001',
        ogrn: '1234567890123',
        objects: [
          {
            id: 1001,
            name: 'Главный офис',
            address: 'г. Москва, ул. Ленина, д. 1, офис 101',
            is_main: true,
            contacts: [
              {
                id: 201,
                full_name: 'Иванов Петр Сергеевич',
                phone: '+7 (999) 111-22-33',
                email: 'p.ivanov@tehnologii.ru',
                is_main: true
              },
              {
                id: 202,
                full_name: 'Сидорова Мария Ивановна',
                phone: '+7 (999) 111-22-44',
                email: 'm.sidorova@tehnologii.ru',
                is_main: false
              }
            ]
          },
          {
            id: 1002,
            name: 'Филиал на севере',
            address: 'г. Москва, ул. Северная, д. 15',
            is_main: false,
            contacts: [
              {
                id: 203,
                full_name: 'Петров Алексей Владимирович',
                phone: '+7 (999) 111-22-55',
                email: 'a.petrov@tehnologii.ru',
                is_main: false
              }
            ]
          }
        ],
        bank_details: {
          bank_name: 'ПАО Сбербанк',
          bik: '044525225',
          account: '40702810123450000001',
          corr_account: '30101810400000000225'
        },
        created_at: '2026-01-31T10:27:16.000000Z',
        updated_at: '2026-02-07T09:15:22.000000Z'
      },
      {
        id: 3,
        name: 'ООО "Эксперт Сервис"',
        type_agent: 1,
        type_org: 2,
        inn: '7702234567',
        kpp: '770201001',
        ogrn: '2234567890124',
        objects: [
          {
            id: 2001,
            name: 'Главный офис',
            address: 'г. Москва, ул. Пушкина, д. 10, офис 205',
            is_main: true,
            contacts: [
              {
                id: 301,
                full_name: 'Петров Андрей Владимирович',
                phone: '+7 (999) 222-33-44',
                email: 'a.petrov@expert-service.ru',
                is_main: true
              },
              {
                id: 302,
                full_name: 'Смирнов Павел Алексеевич',
                phone: '+7 (999) 222-33-55',
                email: 'p.smirnov@expert-service.ru',
                is_main: false
              }
            ]
          }
        ],
        bank_details: {
          bank_name: 'АО Альфа-Банк',
          bik: '044525593',
          account: '40702810234560000002',
          corr_account: '30101810200000000593'
        },
        created_at: '2026-01-30T14:20:10.000000Z',
        updated_at: '2026-02-05T11:30:45.000000Z'
      },
      {
        id: 4,
        name: 'Соколов Дмитрий Игоревич',
        type_agent: 2,
        type_org: 3,
        inn: '7703234568',
        kpp: '770301001',
        ogrn: '3234567890125',
        objects: [
          {
            id: 3001,
            name: 'Главный офис',
            address: 'г. Москва, пр. Мира, д. 25, стр. 2',
            is_main: true,
            contacts: [
              {
                id: 401,
                full_name: 'Соколов Дмитрий Игоревич',
                phone: '+7 (999) 333-44-55',
                email: 'd.sokolov@promresheniya.ru',
                is_main: true
              }
            ]
          },
          {
            id: 3002,
            name: 'Производственный цех №1',
            address: 'г. Москва, пр. Мира, д. 25А',
            is_main: false,
            contacts: [
              {
                id: 402,
                full_name: 'Козлов Иван Петрович',
                phone: '+7 (999) 333-44-66',
                email: 'i.kozlov@promresheniya.ru',
                is_main: false
              }
            ]
          }
        ],
        bank_details: {
          bank_name: 'ПАО ВТБ',
          bik: '044525411',
          account: '40702810345670000003',
          corr_account: '30101810700000000411'
        },
        created_at: '2026-01-29T09:15:30.000000Z',
        updated_at: '2026-02-06T16:20:15.000000Z'
      },
    ];
    
    // Формируем ответ с пагинацией
    return {
      data: {
        current_page: 1,
        data: allOrganizations,
        first_page_url: '/api/organizations?page=1',
        from: 1,
        last_page: 1,
        last_page_url: '/api/organizations?page=1',
        links: [],
        next_page_url: null,
        path: '/api/organizations',
        per_page: 20,
        prev_page_url: null,
        to: allOrganizations.length,
        total: allOrganizations.length
      }
    };
  }
}