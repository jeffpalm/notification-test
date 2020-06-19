create table user_groups_test (
    id serial primary key,
    name text
);

create table users_test (
    id serial primary key,
    user_group int references user_groups_test(id),
    username text
);

create table tickets_test (
    id serial primary key,
    user_id int references users_test(id),
    manager_id int references users_test(id),
    status text,
    created timestamptz(2) default now()
);

create table ticket_msgs_test (
    id serial primary key,
    ticket_id int references tickets_test(id),
    message text
);

create or replace function notify_new_message()
    returns trigger as
$BODY$
    begin
        perform pg_notify('new_ticket_msg', row_to_json(NEW)::text);
        return null;
    end;
$BODY$
    language plpgsql
    cost 100;

create trigger notify_new_message
    after insert
    on "ticket_msgs_test"
    for each row
    execute procedure notify_new_message();

insert into user_groups_test (name) values ('Sales');
insert into user_groups_test (name) values ('Manager');
insert into users_test (username, user_group) values ('testSales', 1);
insert into users_test (username, user_group) values ('testMgr', 2);
insert into tickets_test(user_id, manager_id, status) values (1, 2, 'New');