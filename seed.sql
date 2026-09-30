-- Seed de categorias e produtos (comidas e bebidas)
-- Rode no SQL Editor do Supabase DEPOIS de executar o database.sql.
-- Pode ser executado mais de uma vez: só insere o que ainda não existe.
begin;

-- =========================
-- CATEGORIAS
-- =========================
insert into public.categories (name, description, icon, display_order, active)
select v.name, v.description, v.icon, v.display_order, true
from (values
    -- Comidas
    ('Entradas',           'Petiscos leves para começar a refeição',              '🥗', 1),
    ('Pizzas',             'Pizzas artesanais assadas em forno a lenha',          '🍕', 2),
    ('Hambúrgueres',       'Hambúrgueres artesanais com acompanhamentos',         '🍔', 3),
    ('Sobremesas',         'Doces para fechar a refeição',                        '🍰', 4),
    -- Bebidas
    ('Refrigerantes',      'Refrigerantes gelados em lata e garrafa',             '🥤', 5),
    ('Sucos Naturais',     'Sucos feitos na hora com frutas frescas',             '🍊', 6),
    ('Cervejas',           'Cervejas nacionais e artesanais',                     '🍺', 7),
    ('Águas e Chás',       'Águas, chás gelados e bebidas sem açúcar',            '💧', 8)
) as v(name, description, icon, display_order)
where not exists (
    select 1 from public.categories c where c.name = v.name
);

-- =========================
-- PRODUTOS
-- =========================
insert into public.products ("categoryId", name, description, price, image, available, active)
select c.id, v.name, v.description, v.price, '', true, true
from (values
    -- Entradas
    ('Entradas', 'Bruschetta de Tomate',   'Pão italiano tostado com tomate, manjericão e azeite',          22.90),
    ('Entradas', 'Bolinho de Bacalhau',    'Porção com 6 unidades acompanhada de molho tártaro',            34.90),
    ('Entradas', 'Salada Caesar',          'Alface americana, frango grelhado, croutons e molho caesar',    29.90),

    -- Pizzas
    ('Pizzas', 'Pizza Margherita',         'Molho de tomate, mussarela, tomate fresco e manjericão',        39.90),
    ('Pizzas', 'Pizza Calabresa',          'Mussarela, calabresa fatiada e cebola',                         42.90),
    ('Pizzas', 'Pizza Quatro Queijos',     'Mussarela, provolone, gorgonzola e parmesão',                   49.90),

    -- Hambúrgueres
    ('Hambúrgueres', 'X-Burger',           'Hambúrguer de 150g, queijo prato, alface e tomate',             28.90),
    ('Hambúrgueres', 'X-Bacon',            'Hambúrguer de 150g, queijo cheddar, bacon crocante e maionese', 34.90),
    ('Hambúrgueres', 'Burger Vegetariano', 'Hambúrguer de grão-de-bico com rúcula e tomate seco',           32.90),

    -- Sobremesas
    ('Sobremesas', 'Pudim de Leite',       'Pudim cremoso com calda de caramelo',                           14.90),
    ('Sobremesas', 'Petit Gâteau',         'Bolinho de chocolate com sorvete de creme',                     24.90),
    ('Sobremesas', 'Mousse de Maracujá',   'Mousse aerado com calda de maracujá',                           13.90),

    -- Refrigerantes
    ('Refrigerantes', 'Coca-Cola Lata 350ml',       'Refrigerante de cola gelado',                           6.50),
    ('Refrigerantes', 'Guaraná Antarctica 350ml',   'Refrigerante de guaraná gelado',                        6.50),
    ('Refrigerantes', 'Refrigerante 2 Litros',      'Garrafa de 2 litros (cola, guaraná ou laranja)',       14.90),

    -- Sucos Naturais
    ('Sucos Naturais', 'Suco de Laranja 400ml',     'Laranja espremida na hora, sem açúcar',                 9.90),
    ('Sucos Naturais', 'Suco de Maracujá 400ml',    'Polpa de maracujá batida com água e açúcar a gosto',   10.90),
    ('Sucos Naturais', 'Limonada Suíça 500ml',      'Limão batido com leite condensado e gelo',             12.90),

    -- Cervejas
    ('Cervejas', 'Cerveja Pilsen Long Neck',        'Cerveja pilsen gelada, 355ml',                          9.90),
    ('Cervejas', 'Cerveja Artesanal IPA 500ml',     'IPA lupulada com notas cítricas',                      24.90),
    ('Cervejas', 'Chopp 300ml',                     'Chopp claro cremoso tirado na pressão',                10.90),

    -- Águas e Chás
    ('Águas e Chás', 'Água Mineral sem Gás 500ml',  'Água mineral natural',                                  4.00),
    ('Águas e Chás', 'Água Mineral com Gás 500ml',  'Água mineral gaseificada',                              4.50),
    ('Águas e Chás', 'Chá Gelado de Pêssego 400ml', 'Chá preto gelado com sabor de pêssego',                 8.90)
) as v(category, name, description, price)
join public.categories c on c.name = v.category
where not exists (
    select 1
    from public.products p
    where p."categoryId" = c.id and p.name = v.name
);

commit;

-- Conferência:
-- select c.name as categoria, count(p.id) as produtos
-- from public.categories c
-- left join public.products p on p."categoryId" = c.id
-- group by c.name, c.display_order
-- order by c.display_order;
