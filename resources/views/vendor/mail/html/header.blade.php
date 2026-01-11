@props(['url'])
<tr>
    <td class="header">
        <a href="{{ $url }}"
            style="display: inline-block; text-decoration: none; color: #000; font-weight: bold; font-size: 24px;">
            {{ config('app.name', 'IzyBoost') }}
        </a>
    </td>
</tr>