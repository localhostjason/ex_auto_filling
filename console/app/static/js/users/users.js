$(document).ready(function () {
    function Users() {
        AppCommonClass.call(this);
    }

    Users.prototype = Object.create(AppCommonClass.prototype);
    Users.prototype.constructor = Users;

    var users = new Users();

    var user_modal = $('#user_modal');
    $('.create_user').click(function () {
        users.show_modal(user_modal, $(this));
        user_modal.find('.modal-title').text('添加项目管理员');
    });

    user_modal.on('hide.bs.modal', function () {
        users.hide_modal($(this));
    });
    var btn;
    user_modal.on('show.bs.modal', function (event) {
        btn = $(event.relatedTarget);
        laydate.render({
            elem: '#expiry_time',
            min: moment().format('YYYY-MM-DD'),
            calendar: true,
            value: new Date()
        });
    });

    laydate.render({
        elem: '#expiry_time',
        min: moment().format('YYYY-MM-DD'),
        calendar: true,
        value: new Date()
    });

    $('.submit_user').click(function () {
        var params = user_modal.find('form').serialize();
        var role = btn.data('role');
        params += '&role=' + role || 'user';
        console.log(params);
        $.post('/users/create', params, function (resp) {
            if (resp.success) {
                sessionStorage.setItem("success", resp.message);
                window.location.reload();
            } else {
                toastr.error(resp.message);
            }
        })
    });

    $('.delete-user').click(function () {
        $.update_info_reload('是否删除用户', '/users/delete/' + $(this).data('id'), '');
    });

    // edit user info
    laydate.render({
        elem: '#edit_expiry_time',
        min: moment().format('YYYY-MM-DD'),
        calendar: true,
        value: new Date()
    });
    var edit_user_modal = $('#edit_user_modal');
    edit_user_modal.on('hide.bs.modal', function () {
        users.hide_modal($(this));
    });
    $('.edit_user').click(function () {
        users.show_modal(edit_user_modal, $(this));
        edit_user_modal.find('.modal-title').text('编辑【' + $(this).data('username') + '】基本信息');
    });

    var edit_btn;
    edit_user_modal.on('show.bs.modal', function (event) {
        edit_btn = $(event.relatedTarget);
        var user_id = edit_btn.data('id');
        var modal = $(this);
        if (user_id) {
            $.get('/users/info/' + user_id, function (resp) {
                if (!resp.success) {
                    toastr.error(resp.message);
                    return false;
                }
                var data = resp.data;
                for (var key in data) {
                    modal.find('[name="' + key + '"]').val(data[key]);
                }
            })
        }
    });
    $('.submit_edit_user').click(function () {
        var user_id = edit_btn.data('id');
        var params = edit_user_modal.find('form').serialize();
        $.post('/users/edit/' + user_id, params, function (resp) {
            if (resp.success) {
                sessionStorage.setItem("success", resp.message);
                window.location.reload();
            } else {
                toastr.error(resp.message);
            }
        })
    });

    // create com user
    $('.create_com_user').click(function () {
        users.show_modal(user_modal, $(this));
        user_modal.find('.modal-title').text('添加普通用户');
    });


});

$(document).ready(function () {
    var selection_summary = $('.selection-summary');
    selection_summary.click(function () {
        $(this).toggleClass('open');
        var loop = $(this).data('loop');
        var elm = $(this).parents('tbody').find('.selection-info');
        if ($(this).is('.open') && elm.data('loop') === loop) {
            elm.show()
        } else {
            elm.hide();
        }
    });
});


$(document).ready(function () {
    function PM() {
        AppCommonClass.call(this);

        this.get_file_option = function (data) {
            var project_select_html = '';
            if (!data || !data.length) {
                return project_select_html;
            }

            data.forEach(function (val) {
                project_select_html += '<option value="' + val[0] + '">' + val[1] + '</option>';
            });
            return project_select_html;
        }
    }

    PM.prototype = Object.create(AppCommonClass.prototype);
    PM.prototype.constructor = PM;

    var pm = new PM();
    var pm_modal = $('#fp-pm-modal');

    var uid = 0;
    pm_modal.on('hide.bs.modal', function () {
        pm.hide_modal($(this));
    });
    pm_modal.on('show.bs.modal', function (event) {
        var btn = $(event.relatedTarget);
        uid = btn.data('uid');

        var modal = $(this);
        $.get('/project/group/pm', function (resp) {
            var data = resp['data'];
            var project_select = modal.find('[name="project_group"]');
            console.log(data);
            var project_select_html = pm.get_file_option(data);
            project_select.html(project_select_html);
        })
    });

    $('.fp_pm').click(function () {
        pm.show_modal(pm_modal, $(this));

        var user = $(this).data('user');
        pm_modal.find('.modal-title').text('分配【' + user + '】项目')
    });


    $('.submit_pm').click(function () {
        var params = pm_modal.find('form').serialize();
        $.post('/users/fp_pm?user_id=' + uid, params, function (resp) {
            if (resp.success) {
                pm_modal.modal('hide');
                sessionStorage.setItem('success', resp.message);
                window.location.reload();
            } else
                toastr.error(resp.message)
        })
    });

    var pm_file_modal = $('#fp-file-modal');
    pm_file_modal.on('hide.bs.modal', function () {
        pm.hide_modal($(this));
    });
    pm_file_modal.on('show.bs.modal', function (event) {
        var btn = $(event.relatedTarget);
        uid = btn.data('uid');

        var modal = $(this);
        var data = [];
        $.get('/project/group/pm', function (resp) {
            data = resp['data'];
            var project_select = modal.find('[name="project_group"]');
            console.log(data);
            var project_select_html = pm.get_file_option(data);
            project_select.html(project_select_html);
        }).done(function () {
            if (data) {
                var project_group_id = data[0][0];
                $.get('/project/group/file?project_group_id=' + project_group_id, function (resp) {
                    var file_data = resp['data'];
                    var project_id = modal.find('[name="project_id"]');
                    var project_id_html = pm.get_file_option(file_data);
                    project_id.html(project_id_html);
                    multiselect(project_id);
                })
            }
        })
    });
    pm_file_modal.find('[name="project_group"]').change(function () {
        var selected_id = $(this).val();
        $.get('/project/group/file?project_group_id=' + selected_id, function (resp) {
            var file_data = resp['data'];
            var project_id = pm_file_modal.find('[name="project_id"]');
            var project_id_html = pm.get_file_option(file_data);
            if (!file_data || !file_data.length) {
                project_id_html = '<option value="">无数据</option>'
            }
            project_id.html(project_id_html);
            $('#handler').multiselect('rebuild');
            multiselect(project_id);
        })
    });


    $('.fp_file').click(function () {
        pm.show_modal(pm_file_modal, $(this));

        var user = $(this).data('user');
        pm_file_modal.find('.modal-title').text('分配【' + user + '】文件')
    });
    $('.submit_pm_file').click(function () {
        var form_data = pm_file_modal.find('form').serialize();
        $.post('/users/fp_file?user_id=' + uid, form_data, function (resp) {
            if (resp.success) {
                pm_file_modal.modal('hide');
                sessionStorage.setItem('success', resp.message);
                window.location.reload();
            } else
                toastr.error(resp.message)
        })
    });

    function multiselect(obj) {  //初始化方法
        $(obj).multiselect({
            includeSelectAllOption: true,
            selectAllText: '全选',
            selectAllNumber: false,
            nonSelectedText: '请选择',
            selectAllNumber: false,
            allSelectedText: false
        });
    }
});